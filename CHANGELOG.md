# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-29

### Added

- Branded blog builder form (company name, logo upload, brand color picker, up to 10 topics) with a live browser preview
- AI-generated blog post content via the Groq API (`llama-3.3-70b-versatile`)
- MongoDB-backed, multi-tenant project/post storage via Mongoose
- Project dashboard with live generation progress and per-post retry
- Public, server-rendered branded blog pages per project/post, with dynamically generated Open Graph images
- History page listing every project generated on the deployment
- Dark/light theme toggle
- Docker deployment support (multi-stage `Dockerfile` + `docker-compose.yml`)
- Global form state managed with Zustand, form validation with Zod

[0.1.0]: https://github.com/QuantumWebStudio/zalto/releases/tag/v0.1.0
