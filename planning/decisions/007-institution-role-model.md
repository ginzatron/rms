# ADR 007: Hybrid Institution Role Model

## Status

Accepted

## Context

In GME (Graduate Medical Education), institutions have complex relationships:

1. **Sponsoring Institutions** - Hold ACGME accreditation, run residency programs, have a DIO (Designated Institutional Official), undergo site visits
2. **Participating Institutions** - Provide clinical training sites for another institution's programs via PLAs (Program Letters of Agreement)

The complication: **An institution can be BOTH**. Massachusetts General Hospital:
- Sponsors its own General Surgery program (is a sponsoring institution)
- Participates in Harvard Medical School's programs (is a participating institution)

We needed to model this flexibility while maintaining data integrity and avoiding null-column antipatterns.

## Decision

We implemented a **hybrid role-based model**:

```
institutions (base physical entity)
    ↓
institution_roles (1:N - what roles does this institution play?)
    ├── role = 'sponsoring' → sponsoring_details (1:1 extension with DIO, ACGME status, etc.)
    └── role = 'participating' → (no extra table, just the role record)

participation_agreements (links sponsor_role_id ↔ participant_role_id)
```

### Schema

```sql
CREATE TABLE institution_roles (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES institutions(id),
  role TEXT NOT NULL CHECK (role IN ('sponsoring', 'participating')),
  is_active INTEGER DEFAULT 1,
  effective_date TEXT NOT NULL,
  ended_date TEXT,
  UNIQUE (institution_id, role, effective_date)
);

CREATE TABLE sponsoring_details (
  institution_role_id TEXT PRIMARY KEY REFERENCES institution_roles(id),
  acgme_sponsor_id TEXT UNIQUE,
  dio_user_id TEXT,
  dio_name TEXT,
  dio_email TEXT,
  acgme_status TEXT CHECK (...),
  next_site_visit TEXT,
  last_site_visit TEXT
);

CREATE TABLE participation_agreements (
  id TEXT PRIMARY KEY,
  sponsor_role_id TEXT NOT NULL REFERENCES institution_roles(id),
  participant_role_id TEXT NOT NULL REFERENCES institution_roles(id),
  agreement_type TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  status TEXT,
  applies_to_all_programs INTEGER DEFAULT 1,
  covered_program_ids TEXT
);
```

### Programs reference sponsor roles, not institutions directly:

```sql
CREATE TABLE programs (
  id TEXT PRIMARY KEY,
  sponsor_role_id TEXT NOT NULL REFERENCES institution_roles(id),
  -- not: sponsoring_institution_id
);
```

## Alternatives Considered

### 1. Single table with type column

```sql
CREATE TABLE institutions (
  id TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('sponsoring', 'participating', 'both'))
);
```

**Rejected because**: An institution being "both" still needs separate PLAs, separate accreditation status, etc. The "both" type doesn't capture the complexity.

### 2. Boolean flags

```sql
CREATE TABLE institutions (
  is_sponsoring BOOLEAN,
  is_participating BOOLEAN,
  -- sponsoring-specific columns (nullable when not sponsoring)
  dio_name TEXT,
  acgme_status TEXT,
  -- etc.
);
```

**Rejected because**: Leads to many nullable columns that are only relevant when `is_sponsoring = true`. Violates normalization and makes schema confusing.

### 3. Separate tables with duplication

```sql
CREATE TABLE sponsoring_institutions (...);
CREATE TABLE participating_institutions (...);
```

**Rejected because**: Duplicates base institution data (name, address, company_id). When MGH is both, which table is authoritative?

### 4. Pure role table (no detail extension)

```sql
CREATE TABLE institution_roles (
  id TEXT PRIMARY KEY,
  institution_id TEXT,
  role TEXT,
  -- ALL role-specific columns here
  dio_name TEXT,  -- NULL if not sponsoring
  acgme_status TEXT,  -- NULL if not sponsoring
);
```

**Rejected because**: Still has conditional nulls. Better to separate the sponsoring-specific data into its own table.

## Consequences

### Positive

1. **Clean separation** - Base institution data separate from role-specific data
2. **Flexibility** - Same institution can have multiple roles
3. **Type safety** - No conditional nulls; sponsoring_details only exists when role='sponsoring'
4. **Proper FKs** - Programs reference sponsor_role_id, agreements reference both role IDs
5. **Temporal support** - Can track when roles start/end (effective_date, ended_date)
6. **Multiple PLAs** - Participant can have PLAs with different sponsors

### Negative

1. **More joins** - To get "sponsoring institution with details" requires joining institutions → institution_roles → sponsoring_details
2. **Application validation** - Must validate that sponsoring_details only gets created for role='sponsoring' (can't enforce in FK)
3. **Slightly more complex queries** - But cleaner data model is worth it

## Implementation Notes

- When creating a sponsoring institution, always create both the role AND the sponsoring_details
- Application layer should validate role type before creating sponsoring_details
- Consider adding a view `vw_sponsoring_institutions` for convenience:

```sql
CREATE VIEW vw_sponsoring_institutions AS
SELECT
  i.id as institution_id,
  i.name,
  i.company_id,
  ir.id as sponsor_role_id,
  ir.effective_date,
  sd.acgme_sponsor_id,
  sd.dio_name,
  sd.acgme_status
FROM institutions i
JOIN institution_roles ir ON ir.institution_id = i.id AND ir.role = 'sponsoring'
JOIN sponsoring_details sd ON sd.institution_role_id = ir.id
WHERE ir.is_active = 1;
```
