/**
 * Service to manage direct publishing of updates to the GitHub repository.
 * Utilizes the GitHub REST API for content modifications.
 */

/**
 * Validates the provided Personal Access Token and retrieves repo details.
 * @param {string} token GitHub PAT
 * @param {string} owner Repo owner (username)
 * @param {string} repo Repo name
 * @returns {Promise<boolean>} True if access is valid
 */
export async function verifyGithubAccess(token, owner, repo) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) {
      console.error('GitHub auth verification failed:', response.statusText);
      return false;
    }
    const data = await response.json();
    return data.permissions?.push || false; // Check if token has write access
  } catch (error) {
    console.error('Error verifying GitHub access:', error);
    return false;
  }
}

/**
 * Gets the SHA of a file in the repository (required for updates).
 * @param {string} token GitHub PAT
 * @param {string} owner Repo owner
 * @param {string} repo Repo name
 * @param {string} path File path in repo
 * @returns {Promise<string|null>} File SHA or null if file doesn't exist
 */
async function getFileSha(token, owner, repo, path) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (response.status === 404) return null; // File does not exist yet
    if (!response.ok) throw new Error(`Failed to fetch file SHA: ${response.statusText}`);
    const data = await response.json();
    return data.sha;
  } catch (error) {
    console.error(`Error fetching SHA for ${path}:`, error);
    return null;
  }
}

/**
 * Uploads a base64 file (image, PDF, etc.) to the GitHub repository.
 * @param {string} token GitHub PAT
 * @param {string} owner Repo owner
 * @param {string} repo Repo name
 * @param {string} base64Data Full base64 DataURL (e.g. data:image/jpeg;base64,... or data:application/pdf;base64,...)
 * @param {string} repoPath Target path in repository (e.g. 'public/resume.pdf' or 'public/images/img.jpg')
 * @param {string} commitMessage Commit message for this update
 * @returns {Promise<string>} Target path relative to public/
 */
export async function uploadFileToGithub(token, owner, repo, base64Data, repoPath, commitMessage) {
  const commaIndex = base64Data.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Invalid base64 data URL format');
  }
  const rawBase64 = base64Data.slice(commaIndex + 1);

  // Check if file already exists (get SHA to overwrite if it does)
  const sha = await getFileSha(token, owner, repo, repoPath);

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: commitMessage || `Upload asset: ${repoPath}`,
      content: rawBase64,
      ...(sha && { sha })
    })
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to upload ${repoPath}: ${response.status} ${errorDetails}`);
  }

  // Return relative path without 'public/' prefix
  return repoPath.startsWith('public/') ? repoPath.replace(/^public\//, '') : repoPath;
}

/**
 * Uploads a base64 image file to the GitHub repository.
 * @param {string} token GitHub PAT
 * @param {string} owner Repo owner
 * @param {string} repo Repo name
 * @param {string} base64Data Full base64 DataURL (e.g. data:image/jpeg;base64,...)
 * @param {string} filename Target filename
 * @returns {Promise<string>} Relative path to the uploaded image in the project
 */
export async function uploadImageToGithub(token, owner, repo, base64Data, filename) {
  const path = `public/images/${filename}`;
  return uploadFileToGithub(token, owner, repo, base64Data, path, `Upload image asset: ${filename}`);
}

/**
 * Uploads a base64 PDF resume file to public/resume.pdf on GitHub.
 * @param {string} token GitHub PAT
 * @param {string} owner Repo owner
 * @param {string} repo Repo name
 * @param {string} base64Data Full base64 DataURL (data:application/pdf;base64,...)
 * @returns {Promise<string>}
 */
export async function uploadResumePdfToGithub(token, owner, repo, base64Data) {
  const path = 'public/resume.pdf';
  return uploadFileToGithub(token, owner, repo, base64Data, path, 'Update official PDF resume document');
}

/**
 * Commits the updated projects.json file back to the repository.
 * @param {string} token GitHub PAT
 * @param {string} owner Repo owner
 * @param {string} repo Repo name
 * @param {Array} projects The updated projects array
 * @returns {Promise<boolean>} True if successful
 */
export async function publishProjectsJson(token, owner, repo, projects) {
  const path = 'public/projects.json';
  
  // Format json with 2 spaces for beautiful git diffs
  const jsonContent = JSON.stringify(projects, null, 2);
  // Encode string as base64 (supporting UTF-8 characters safely)
  const base64Content = btoa(unescape(encodeURIComponent(jsonContent)));

  // Always fetch latest SHA to prevent out-of-sync conflicts
  const sha = await getFileSha(token, owner, repo, path);
  if (!sha) {
    throw new Error('Could not retrieve projects.json from repository. Verify path exists.');
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update projects metadata database',
      content: base64Content,
      sha: sha
    })
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to publish projects.json: ${response.status} ${errorDetails}`);
  }

  return true;
}
