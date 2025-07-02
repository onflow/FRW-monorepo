# Playwright Reports to Google Cloud Storage Setup

## Problem

The Playwright reports are getting too big for GitHub Pages and need to be moved to Google Cloud Storage.

## Current Setup Analysis

- Current workflow in `.github/workflows/build.yml` uses GitHub Pages deployment (lines 229-297)
- Reports are sanitized using `build/sanitize-playwright.ts` before publishing
- Each report stored in `/reports/run-{github.run_id}/` directory
- 99+ historical report runs consuming ~26MB total storage

## Google Cloud Storage Setup Steps

### 1. Create the GCS Bucket

```bash
# Set your project ID and bucket name
export PROJECT_ID="your-project-id"
export BUCKET_NAME="frw-playwright-reports"  # Must be globally unique

# Create the bucket with public access
gsutil mb -p $PROJECT_ID gs://$BUCKET_NAME

# Enable uniform bucket-level access
gsutil uniformbucketlevelaccess set on gs://$BUCKET_NAME

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
```

### 2. Configure for Static Website Hosting

```bash
# Set main page and error page
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

# Set CORS policy for cross-origin requests
echo '[{"origin":["*"],"method":["GET"],"responseHeader":["Content-Type"],"maxAgeSeconds":3600}]' > cors.json
gsutil cors set cors.json gs://$BUCKET_NAME
rm cors.json
```

### 3. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create playwright-reports \
    --display-name="Playwright Reports Uploader"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:playwright-reports@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

# Create and download key file
gcloud iam service-accounts keys create key.json \
    --iam-account="playwright-reports@$PROJECT_ID.iam.gserviceaccount.com"

# Base64 encode the key for GitHub secrets
base64 -i key.json -o key-base64.txt
```

### 4. Set GitHub Repository Secrets

In your GitHub repository settings → Secrets and variables → Actions, add:

- `GCP_SA_KEY`: Contents of `key-base64.txt`
- `GCS_BUCKET_NAME`: Your bucket name (e.g., `frw-playwright-reports`)
- `GCP_PROJECT_ID`: Your GCP project ID

### 5. Optional: Set Lifecycle Policy

```bash
# Create lifecycle policy to auto-delete old reports (30 days)
cat > lifecycle.json << EOF
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {"age": 30}
    }
  ]
}
EOF

gsutil lifecycle set lifecycle.json gs://$BUCKET_NAME
rm lifecycle.json
```

### 6. Test the Setup

```bash
# Test upload
echo "<h1>Test Report</h1>" > test.html
gsutil cp test.html gs://$BUCKET_NAME/test/index.html

# Verify public access
curl https://storage.googleapis.com/$BUCKET_NAME/test/index.html

# Clean up test
gsutil rm gs://$BUCKET_NAME/test/index.html
```

## GitHub Actions Workflow Changes

Replace the current deploy job (lines 229-297) in `.github/workflows/build.yml` with:

```yaml
deploy:
  needs: [build, test]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/dev'

  steps:
    - uses: actions/checkout@v4

    - name: Download Playwright report
      uses: actions/download-artifact@v4
      with:
        name: playwright-report
        path: playwright-report

    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v2

    - name: Upload reports to GCS
      run: |
        # Create run-specific directory
        RUN_DIR="reports/run-${{ github.run_id }}"

        # Upload with public-read access
        gsutil -m cp -r playwright-report/* gs://${{ secrets.GCS_BUCKET_NAME }}/$RUN_DIR/
        gsutil -m acl ch -r -u AllUsers:R gs://${{ secrets.GCS_BUCKET_NAME }}/$RUN_DIR/

        # Update index.html with links to recent reports
        echo "Report available at: https://storage.googleapis.com/${{ secrets.GCS_BUCKET_NAME }}/$RUN_DIR/index.html"
```

## Benefits Over GitHub Pages

1. **No size limits** - GCS can handle much larger reports
2. **Better performance** - Google's CDN for faster loading
3. **Cost effective** - Pay only for storage used
4. **Retention control** - Set lifecycle policies to auto-delete old reports
5. **Better security** - Fine-grained access controls

## Access URLs

Reports will be accessible at:
`https://storage.googleapis.com/YOUR_BUCKET_NAME/reports/run-GITHUB_RUN_ID/index.html`

## Next Steps

1. Complete GCS bucket setup using the commands above
2. Add GitHub secrets to repository
3. Implement the workflow changes in `.github/workflows/build.yml`
4. Test with a new commit to verify the setup works

## Task Status

- [x] Research current Playwright reporting setup in GitHub Actions
- [x] Investigate Google Cloud Storage bucket setup for hosting reports
- [x] Design workflow modification to upload reports to GCS instead of GitHub Pages
- [ ] Implement GitHub Actions workflow changes (pending bucket setup completion)
