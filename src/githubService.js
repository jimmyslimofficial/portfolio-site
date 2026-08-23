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
 * Uploads a base64 image file to the GitHub repository.
 * @param {string} token GitHub PAT
 * @param {string} owner Repo owner
 * @param {string} repo Repo name
 * @param {string} base64Data Full base64 DataURL (e.g. data:image/jpeg;base64,...)
 * @param {string} filename Target filename
 * @returns {Promise<string>} Relative path to the uploaded image in the project
 */
export async function uploadImageToGithub(token, owner, repo, base64Data, filename) {
  // Strip the prefix (e.g., "data:image/jpeg;base64,") to get raw base64
  const commaIndex = base64Data.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Invalid base64 image data URL format');
  }
  const rawBase64 = base64Data.slice(commaIndex + 1);
  const path = `public/images/${filename}`;

  // Check if file already exists (get SHA to overwrite if it does)
  const sha = await getFileSha(token, owner, repo, path);

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Upload image asset: ${filename}`,
      content: rawBase64,
      ...(sha && { sha }) // Include SHA only if file exists to overwrite it
    })
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to upload image ${filename}: ${response.status} ${errorDetails}`);
  }

  // Return the relative path to be stored in projects.json (relative to public/ directory for local fetches)
  return `images/${filename}`;
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
