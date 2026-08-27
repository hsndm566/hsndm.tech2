# UI Enhancement Research

## Selected source pattern

Use **HyperUI** as a copy-paste pattern source for public-site enhancements. It is MIT-licensed, requires no package installation, and provides Tailwind CSS v4 components for marketing sites, web apps, and ecommerce.

- Repository: https://github.com/markmead/hyperui
- Component catalogue: https://hyperui.dev/
- License: MIT

The planned use is limited to structural ideas for compact trust strips, responsive workflow cards, and focus-visible action affordances. Existing HSNDM public-site tokens, content, CTA destinations, responsive behavior, motion settings, and accessibility semantics remain authoritative.

## Assessed but not selected for runtime installation

**Preline UI** is MIT-licensed and has accessible Tailwind blocks and plugins, but its runtime JavaScript and CSS integration would introduce an unnecessary dependency for the current targeted changes.

- Repository: https://github.com/htmlstreamofficial/preline
- Blocks: https://preline.co/blocks/
- License: MIT

**Flowbite** is MIT-licensed and supplies Tailwind v4 and native RTL support, but its plugin/runtime setup is unnecessary because this site already owns React behavior and responsive/RTL logic.

- Repository: https://github.com/themesberg/flowbite
- Documentation: https://flowbite.com/docs/
- License: MIT

**Page UI** is MIT-licensed but currently states Tailwind v3 support, so it is not an appropriate direct integration path for this Tailwind v4 project.

- Repository: https://github.com/PageAI-Pro/page-ui
- License: MIT

**Bklit UI** was the chart-component library referred to as “buklit” or “bullet” in the request. Its chart components and shadcn registry are MIT-licensed, while Bklit Studio is proprietary. The compact KPI card patterns are relevant inspiration for future authenticated dashboard reporting, but are not appropriate to install on this public marketing page because they would introduce a shadcn-registry dependency and data-visualization runtime without truthful public metrics to display.

- Repository: https://github.com/bklit/bklit-ui
- Blocks: https://bklit.com/blocks
- License: MIT for chart components; proprietary for Bklit Studio

## UX guidance

The installed local `ui-ux-pro-max` skill is already available. It is adapted from Next Level Builder's MIT-licensed UI UX Pro Max source and will guide this work. The generated generic design-system colors are advisory only; they are not selected because the user explicitly requested preservation of the established warm-paper, near-black, and signal-orange HSNDM identity.
