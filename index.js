const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');

const token = process.env.GITHUB_TOKEN;
let octokit;

// Return issue body, plus the metadata header if from a standard issue template
const getTemplateFromFile = async (templateFilePath) => {
  if (!templateFilePath) {
    return;
  }

  let body = '';
  let metadata = {};

  core.info(`Getting contents of: ${templateFilePath}`);

  // Get contents of template file
  try {
    body = (await octokit.repos.getContent({
      ...github.context.repo,
      path: templateFilePath,
      mediaType: {
        format: 'raw'
      }
    })).data;
  } catch (error) {
    core.error(`Error encountered retrieving issue template: ${error}`);
  }

  core.debug(`template: ${body}`);

  // Does this issue template have a YAML header at the top
  const hasHeader = body.slice(0, 3) === '---';

  if (hasHeader) {
    // Get header, which is formatted as YAML key/values
    const header = yaml.safeLoad(body.split('---')[1].trim());

    core.info(`header: ${header}`);

    metadata = {
      assignees: header.assignees || '',
      labels: header.labels || '',
      title: header.title || ''
    };

    // Assume if none of these are set, it's just a normal HR ¯\_(ツ)_/¯
    // https://github.com/imjohnbo/issue-bot/issues/14
    if (metadata.assignees || metadata.labels || metadata.title) {
      // remove unnecessary YAML metadata found at the top of issue templates
      // https://help.github.com/en/github/building-a-strong-community/about-issue-and-pull-request-templates#issue-templates
      body = body.split('---').slice(2).join('---').trim();
    }
  }

  core.info(`Found body: ${body}`);
  core.info(`Found metadata: ${JSON.stringify(metadata)}`);

  return {
    body: body || '',
    metadata: metadata || {}
  };
};

// most @actions toolkit packages have async methods
async function run () {
  try {
    const path = core.getInput('path', { required: true });
    const token = core.getInput('token');
    octokit = github.getOctokit(token);
    
    core.info(`Getting template at path: ${path}`);

    const { body, metadata } = await getTemplateFromFile(path);

    core.setOutput('body', body);
    core.setOutput('title', metadata.title);
    core.setOutput('labels', metadata.labels);
    core.setOutput('assignees', metadata.assignees);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
