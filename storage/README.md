# Runtime storage

This directory contains runtime data shared by the applications:

- `uploads/images`: uploaded images
- `uploads/videos`: uploaded videos
- `uploads/files`: other uploaded files
- `uploads/.chunks`: incomplete multipart chunks, removed by abort/expiry cleanup
- `database`: local SQLite databases
- `logs`: application logs
- `certificates/payment`: private payment certificates and keys

Only this documentation and `.gitkeep` placeholders belong in Git. Runtime files
and secrets must be persisted or mounted separately in every deployment.
