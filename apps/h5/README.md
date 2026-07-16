# H5 application

This directory is reserved for the mobile web application.

When the H5 technology stack is selected, initialize it in this directory and add
`apps/h5` to the root `workspaces` list. Its route and asset base must be `/h5/`,
and its production output must be `apps/api/public/h5`. Add its build command
between `build:admin` and `build:api` in the root build script. Do not place H5
business code in `apps/admin`.
