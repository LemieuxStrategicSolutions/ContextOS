---
type: RelationshipCRM
title: People
description: AI-maintained tiered relationship CRM — cadence, last/next touch, birthdays.
tags: [people, crm, relationships, operational]
timestamp: "{{TODO: ISO 8601 datetime, set at generation}}"
---

# PEOPLE — relationship engine

<!-- AI-maintained CRM. Purpose: beat out-of-sight-out-of-mind — surface the right person
     at the right moment, ideally with a touch message already drafted. {{USER_NAME}}
     interacts conversationally; this file is the engine room. -->

## How this works

**Five tiers, each with a default touch cadence** (per-person overrides in their row):

| Tier | Who | Default cadence | Why |
|------|-----|-----------------|-----|
| 1 — Family | Immediate family, chosen family | continuous / event-driven | Never let a birthday or big moment slip. |
| 2 — Clients / commitments | People {{USER_NAME}} owes ongoing value | 2–4 weeks | Relationship IS the work. |
| 3 — Work | Team, boss, close collaborators | weekly–biweekly | Keep the day-to-day warm. |
| 4 — Network | Mentors, former colleagues, industry contacts | 1–3 months | Long game; most likely to silently decay. |
| 5 — Personal | Friends, community | monthly-ish | Life quality. |

**Status legend:** 🟢 in cadence · 🟡 due soon · 🔴 overdue · ⚪️ baseline unset

**Weekly pulse** (part of the weekly review, or its own automation — register it in
`AUTOMATIONS.md`): recompute status, surface 🔴/🟡 people and upcoming birthdays into the
daily note, pre-draft a touch message for each surfaced person.

**Row format:**

| Name | Relationship | Cadence | Last touch | Next due | Birthday | Notes |
|------|--------------|---------|------------|----------|----------|-------|

## Tier 1 — Family

| Name | Relationship | Cadence | Last touch | Next due | Birthday | Notes |
|------|--------------|---------|------------|----------|----------|-------|
| {{TODO: from interview}} | | | ⚪️ | | | |

## Tier 2 — Clients / commitments

| Name | Relationship | Cadence | Last touch | Next due | Birthday | Notes |
|------|--------------|---------|------------|----------|----------|-------|

## Tier 3 — Work

| Name | Relationship | Cadence | Last touch | Next due | Birthday | Notes |
|------|--------------|---------|------------|----------|----------|-------|

## Tier 4 — Network

| Name | Relationship | Cadence | Last touch | Next due | Birthday | Notes |
|------|--------------|---------|------------|----------|----------|-------|

## Tier 5 — Personal

| Name | Relationship | Cadence | Last touch | Next due | Birthday | Notes |
|------|--------------|---------|------------|----------|----------|-------|

## Intake queue
<!-- names mentioned in sessions/captures that haven't been tiered yet; the weekly pulse
     proposes tier + cadence for each -->
- *(empty)*
