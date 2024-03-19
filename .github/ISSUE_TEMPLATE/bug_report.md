---
name: Bug report
about: Create a report to help us improve
title: ""
labels: bug
assignees: ""
body:
    - type: textarea
      attributes:
          label: Environment
          description: Let us know what version you are running as well as what your environment looks like (OS, NodeJS version, etc)
          placeholder: Environment
      validations:
          required: true
    - type: textarea
      attributes:
          label: Reproduction
          description: Please provide a link to a repo that can reproduce the problem you ran into. A **minimal reproduction** is required unless you are absolutely sure that the issue is obvious and the provided information is enough to understand the problem. If a report is vague (e.g. just a generic error message) and has no reproduction, it will receive a "need reproduction" label. If no reproduction is provided we might close it.
          placeholder: Reproduction
      validations:
          required: true
    - type: markdown
      attributes:
          label: Describe the bug
          description: A clear and concise description of what the bug is. If you intend to submit a PR for this issue, tell us in the description. Thanks!
          placeholder: Bug description
      validations:
          required: true
    - type: markdown
      attributes:
          label: Additional context
          description: Add any other context about the problem here.
---
