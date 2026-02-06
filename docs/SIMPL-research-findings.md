# SIMPL Platform Research Findings

Research conducted: February 2026
Purpose: Gain insights for RMS EPA Assessment Platform design

---

## Executive Summary

The SIMPL (Society for Improving Medical Professional Learning) platform is the gold standard for surgical education workplace-based assessments, deployed to **400+ programs** across **28 specialties** in **6 countries** with **600,000+ evaluations**. In 2022, the American Board of Surgery selected SIMPL to provide the mobile platform for the national EPA Project.

This document captures key insights that can inform our RMS platform design.

---

## Key SIMPL Features & Design Principles

### 1. Assessment Workflow (Critical Insight)

**Real-time capture is essential.** SIMPL emphasizes immediate assessment after observed activities:

- Assessments must be completed within **7 days** before auto-removal
- Late assessors receive **automated email reminders** citing research on how delays degrade feedback quality
- Mobile-first design enables assessment immediately post-procedure

**RMS Implication:** Consider adding assessment expiration and reminder systems.

### 2. The Zwisch Scale (Intraoperative Autonomy)

SIMPL uses the **Zwisch Scale** for intraoperative assessments—a 4-level framework for describing faculty guidance and resident autonomy:

| Level | Name | Faculty Role | Resident Role |
|-------|------|--------------|---------------|
| 1 | **Show & Tell** | Performs >50% of critical portion; demonstrates key concepts | Opens/closes; observes during critical portion |
| 2 | **Active Help** | Leads resident for >50%; optimizes field; coaches skills | Actively assists; practices component skills |
| 3 | **Passive Help** | Follows resident's lead for >50%; acts as capable first assistant | Sets up next steps; recognizes critical transitions |
| 4 | **Supervision Only** | No unsolicited advice for >50%; monitors safety | Mimics independence; safely completes without guidance |

**RMS Implication:** Our entrustment levels (1-5) align with the ABS EPA framework, not Zwisch. This is correct for EPA assessments. However, for intraoperative assessments specifically, consider adding Zwisch-style behavioral anchors.

### 3. Case Complexity Assessment

SIMPL asks raters to classify case complexity **relative to their own practice**:
- Easiest 1/3 (Straightforward)
- Middle 1/3 (Moderate)
- Hardest 1/3 (Complex)

This contextualizes performance data without imposing uniform standards across institutions.

**RMS Implication:** We have `case_urgency` (elective/urgent/emergent) and `patient_asa_class`, but **case complexity** is a distinct, valuable dimension we should add.

### 4. EPA Entrustment Levels (ABS Framework)

The official ABS EPA framework uses **5 levels** that align with our current implementation:

| Level | Name | Description |
|-------|------|-------------|
| 1 | Observation Only | No execution, even with direct supervision |
| 2 | Direct Supervision | Performs with proactive oversight |
| 3 | Reactive/Indirect Supervision | Performs; supervisor available on request |
| 4 | Distance/Post-hoc Supervision | Minimal direct oversight |
| 5 | Supervisory Role | Can supervise junior colleagues |

**RMS Status:** ✅ Our schema matches this exactly.

### 5. Assessment Capture Flow

The SIMPL mobile app follows a streamlined 3-step flow:

1. **Case Complexity** - Straightforward / Moderate / Complex
2. **Entrustment Level** - Select prospective entrustment for similar future case
3. **Narrative Feedback** - Voice dictation or text (skippable)

**Key insight:** The question asked is about **prospective entrustment** ("What level would you grant next time?") rather than retrospective performance rating.

**RMS Implication:** Our `entrustment_level` field semantically aligns with this prospective framing. We should ensure UI copy reflects this.

### 6. Dual Assessment Scales

SIMPL distinguishes between:
- **Retrospective Entrustment (Autonomy)** - 4-point scale reflecting what happened
- **Prospective Entrustment (Performance)** - 5-point scale for future trust

**RMS Implication:** Consider whether capturing both dimensions adds value. For MVP, single entrustment level is sufficient.

### 7. Behavioral Descriptors

EPA assessments are grounded in **behavioral descriptors** for each entrustment level within each care phase:
- Preoperative behaviors
- Intraoperative behaviors
- Postoperative behaviors

Faculty can provide feedback anchored to specific behaviors, creating a clear trajectory for skill development.

**RMS Implication:** Our `epa_definitions` table could be extended with behavioral descriptors per level. Consider adding an `epa_level_descriptors` table.

---

## Technical Architecture Insights

### Infrastructure
- Cloud-based with automated data pipelines
- Multi-layer security with auditing
- HIPAA, FERPA, and IRB compliant
- Supports multi-institutional data sharing with governance

### Data Network Model
- Members retain rights to institutional data
- Collective infrastructure benefits all participants
- Transparent governance for data ownership and usage

**RMS Implication:** For future multi-tenant expansion, SIMPL's governance model provides a blueprint.

---

## Success Factors for Assessment at Scale

### 1. Minimal Training Required
Research showed **one-hour faculty training** was sufficient for reliable ratings. Simplicity is key.

### 2. Trust Building
Two dimensions of trust required:
- **Process Trust** - Evidence-based training, visible research supporting methods
- **Data Trust** - Transparent governance, clear ownership policies

### 3. Explicit Connection to Patient Safety
"The collective goal is to improve the quality of patient care" - motivates participation beyond compliance.

### 4. BID Model Integration
The assessment integrates with teaching workflow:
- **Briefing** - Negotiate expected autonomy level before procedure
- **Intra-operative** - Use Zwisch language for level-appropriate teaching
- **Debriefing** - Discuss whether expected levels were achieved

---

## Gap Analysis: RMS vs SIMPL

| Feature | SIMPL | RMS Current | Recommendation |
|---------|-------|-------------|----------------|
| Entrustment levels (1-5) | ✅ | ✅ | - |
| Case complexity | ✅ 3-tier | ❌ | Add `case_complexity` field |
| Assessment expiration | ✅ 7 days | ❌ | Consider for data quality |
| Reminder system | ✅ Automated | ❌ | Future enhancement |
| Voice dictation | ✅ | ❌ | Mobile feature |
| Behavioral descriptors | ✅ Per EPA/level | ❌ | Add `epa_level_descriptors` table |
| Zwisch scale (OR) | ✅ | ❌ | Optional for intraoperative |
| Resident self-assessment | ✅ | ❌ | Consider adding |
| Mobile-first | ✅ | Planned | Priority |
| Case urgency | ✅ | ✅ | - |
| ASA class | ✅ | ✅ | - |
| Narrative feedback | ✅ | ✅ | - |
| Assessment acknowledgment | ? | ✅ | - |

---

## Recommended Enhancements for RMS

### High Priority (Consider for MVP)

1. **Add Case Complexity Field**
   ```sql
   CREATE TYPE case_complexity AS ENUM ('straightforward', 'moderate', 'complex');
   -- Add to epa_assessments table
   ```

2. **Clarify Entrustment Question Framing**
   UI should ask: "Based on this observation, what entrustment level would you grant for a **similar future case**?"

3. **Add Behavioral Descriptors**
   Store EPA-specific behavioral anchors for each entrustment level to guide feedback.

### Medium Priority (Post-MVP)

4. **Assessment Freshness Indicator**
   Track time between observation and assessment submission.

5. **Resident Self-Assessment**
   Allow residents to self-rate before seeing faculty assessment (calibration).

6. **Voice-to-Text Feedback**
   Critical for mobile adoption—typing feedback is a barrier.

### Lower Priority (Future)

7. **Zwisch Scale for OR Assessments**
   Add optional intraoperative autonomy scale alongside EPA entrustment.

8. **Automated Reminders**
   Nudge faculty for pending assessments.

9. **Dual Entrustment Tracking**
   Capture both retrospective (what happened) and prospective (future trust) separately.

---

## Sources

- [SIMPL Platform](https://simpl.org/)
- [Implementing Workplace-Based Assessments at Scale: The SIMPL Approach](https://pmc.ncbi.nlm.nih.gov/articles/PMC10735067/)
- [ABS Entrustable Professional Activities](https://www.absurgery.org/get-certified/epas/)
- [The Language of Progressive Autonomy: Using the Zwisch Scale](https://www.facs.org/for-medical-professionals/news-publications/journals/rise/articles/zwisch/)
- [EPAs and Applications to Surgical Training (ACS)](https://www.facs.org/for-medical-professionals/news-publications/journals/rise/articles/entrustable/)
- [Assessment of Surgical Autonomy (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9563548/)

---

## Conclusion

Our RMS platform's core data model is well-aligned with the ABS EPA framework that SIMPL implements. The key insight is that **SIMPL's success comes from workflow simplicity and behavioral anchoring**, not complex data structures.

The highest-impact enhancement would be adding **case complexity** as a contextual dimension and ensuring our UI frames entrustment as a **prospective** decision about future trust, not just a rating of past performance.

The Zwisch scale is complementary but distinct—useful for intraoperative teaching conversations but not required for EPA compliance.
