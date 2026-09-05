# Summer Crest Learning Academy

A full-stack parent portal and admin platform built for a childcare business, replacing manual, paper-based processes with a centralized digital system.

## Problem Statement

Summer Crest Learning Academy managed enrollment, billing, and family communication through manual, paper-based processes. Parents had no self-service way to view announcements, track their child's records, or manage billing, and staff spent significant time on administrative tasks that could be handled through a digital system. The academy needed a secure, role-based platform that could scale as its feature set grew, without requiring a dedicated in-house engineering team to maintain it.

## Methodology

The platform was architected as an 18-page full-stack web application with two primary user experiences: a parent portal and an admin dashboard, each gated by role-based access control so that parents and staff only see what's relevant to them.

- Designed the PostgreSQL schema in Supabase to model families, students, billing records, and announcements, with authentication and row-level access rules enforced at the database layer.
- Integrated a RESTful API through Supabase Edge Functions to handle secure data operations between the frontend and database.
- Built a library of 7 reusable React components, including a collapsible navigation system, designed for extensibility as new features are added.
- Developed a student ledger system to track billing and account activity, reducing the need for manual bookkeeping.

## Stack

- **Frontend:** React, reusable component library, collapsible navigation
- **Backend:** Node.js, RESTful API via Supabase Edge Functions
- **Database:** PostgreSQL (Supabase), authentication, role-based access control
- **Hosting/Infra:** Supabase (Cloud)

## Results

- Deployed a production-ready, 18-page platform currently serving 15 active families.
- Replaced manual admin workflows (enrollment tracking, billing, announcements) with a centralized digital system.
- Established a component architecture designed to scale as the client's feature set expands, without requiring a full rebuild.
