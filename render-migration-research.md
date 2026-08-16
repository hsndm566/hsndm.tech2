# Render Migration and Free Health-Ping Research

## Verified provider state

The user-supplied Render API credential authenticated successfully. Workspace `tea-d9v4c83jgndc73akurl0` contains the original `autoapply-sa` Python web service (`srv-d9vm7ck9v7es73b6k78g`) from `hsndm566/autoapply-sa`, plus the newly verified portal service (`srv-da12uke1egvs739s2jhg`) from `hsndm566/hsndm.tech2`. The portal deploy reached `live`; its Render hostname responds with HTTP 200 on both `/` and `/healthz`. The Python service responds HTTP 200 on `/healthz`.

The legacy Python service currently carries **unverified** Render custom-domain claims for `hsndm.tech` and `www.hsndm.tech`. It must not receive the public frontend domain, because its root currently returns 404; those claims must be moved only after the portal service is ready and the DNS targets returned by Render are known.

## External keep-awake research

Render’s official Free plan documentation says free web services spin down after 15 minutes without inbound HTTP/WebSocket traffic, take about one minute to resume, and consume shared free instance hours whenever they remain running. Render explicitly describes paid instances as the way to remove those free-tier limitations. [1]

Render’s own cron jobs are not free: documentation states a minimum monthly charge of $1 per cron job. [2]

Independent developer evidence shows a common workaround: an external HTTP request to a harmless health route just inside the 15-minute threshold. The small GitHub project `tobisupreme/keep-alive-render` documents a 14-minute request pattern and explicitly notes the monthly usage caveat. [3] A GitHub Community discussion and a Reddit thread both caution that this is a workaround, not a provider-guaranteed always-on solution; the Reddit example reports a 503 during an attempted wake-up. [4] [5]

For an external, repository-managed option, GitHub Actions scheduled workflows support POSIX cron schedules with a minimum 5-minute interval. GitHub documents that scheduled workflows run from the default branch, and external community discussion notes schedules can be delayed during high-load periods. [6] [7]

## Current safe conclusion

The only zero-extra-service option that matches the user’s requirement to avoid placing a timer inside the application is a minimal GitHub Actions workflow in `hsndm566/autoapply-sa` that calls `https://autoapply-sa.onrender.com/healthz` on a 10-minute schedule and supports manual dispatch. It is still a workaround, not a production availability guarantee, and it will keep the free service consuming its free instance-hour allocation while it remains awake.

## Sources

1. https://render.com/docs/free
2. https://render.com/docs/cronjobs
3. https://github.com/tobisupreme/keep-alive-render
4. https://github.com/orgs/community/discussions/197645
5. https://www.reddit.com/r/node/comments/1bhlegl/using_cron_job_scheduler_for_spinning_up_my/
6. https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
7. https://docs.github.com/actions/using-workflows/events-that-trigger-workflows
