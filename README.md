# Extract Issue Template Fields
> Extract issue template fields with GitHub Actions

## About
GitHub [issue templates](https://docs.github.com/en/github/building-a-strong-community/about-issue-and-pull-request-templates#issue-templates) are great. You can use them to standardize issue contributor experience. This action lets you pull the body, title, labels, and assignees from an issue template for use with downstream actions or applications.

Pairs nicely with [`issue-bot`](https://github.com/imjohnbo/issue-bot) 🦾.

## Usage

#### On its own

```yml
on:
  workflow_dispatch

name: Extract template fields

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    # Get the title, labels, assignees, and body of the issue template at the path,
    # .github/ISSUE_TEMPLATE/my_template.md, if available.
    - uses: imjohnbo/extract-issue-template-fields@v0.0.1
      id: extract
      with:
        path: .github/ISSUE_TEMPLATE/my_template.md
      env: 
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    # Log outputs of previous step
    - run: |-
        echo $ASSIGNEES $LABELS $TITLE $BODY
      env:
        ASSIGNEES: ${{ steps.extract.outputs.assignees }}
        LABELS: ${{ steps.extract.outputs.labels }}
        TITLE: ${{ steps.extract.outputs.title }}
        BODY: ${{ steps.extract.outputs.body }}
```

### With `issue-bot`

For more, see https://github.com/imjohnbo/issue-bot.

```yml
on:
  schedule:
  # On the first day of every month. See more at https://crontab.guru/#0_0_1_*_*.
  - cron: 0 0 1 * * 

name: Create scheduled issue from template

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    # Get the title, labels, assignees, and body of the issue template at the path,
    # .github/ISSUE_TEMPLATE/my_template.md, if available.
    - uses: imjohnbo/extract-issue-template-fields@main
      id: extract
      with:
        path: .github/ISSUE_TEMPLATE/my_template.md
      env: 
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    # Create new issue with assignees, labels, title, and body
    - uses: imjohnbo/issue-bot@release/v3
      with:
        assignees: ${{ steps.extract.outputs.assignees }}
        labels: ${{ steps.extract.outputs.labels }}
        title: ${{ steps.extract.outputs.title }}
        body: ${{ steps.extract.outputs.body }}
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Contributing

Feel free to open an issue, or better yet, a
[pull request](https://github.com/imjohnbo/extract-issue-template-fields/compare)!

## License

[MIT](LICENSE)
