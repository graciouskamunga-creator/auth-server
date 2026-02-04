# TODO: Fix auth.service.ts Errors

- [x] Update all prisma.session references to prisma.refreshToken
- [x] In login function: Hash refresh token and create RefreshToken entry
- [x] In refresh function: Hash input for lookup, fetch user role, generate and hash new refresh token, fix access token payload
- [x] Update logout function to use refreshToken model
- [x] Run the project to verify fixes
