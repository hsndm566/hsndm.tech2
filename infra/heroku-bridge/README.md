# Heroku migration bridge

Temporary ChatGPT-operated migration helper.

It uses Heroku Platform API bearer authentication supplied only through runtime environment variables. No credentials are stored in Git.

Supported actions:
- account
- list_apps
- create_app
- get_app
- set_config
- build
- build_status
- formations
- scale
- create_addon
- list_addons
- create_domain
- list_domains

This service is intended for the AutoApply SA migration and can be disabled after cutover.
