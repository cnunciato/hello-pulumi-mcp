# S3 Static Website with CloudFront CDN using Pulumi

This project demonstrates how to use [Pulumi](https://www.pulumi.com/) to provision and manage AWS infrastructure for hosting a static website. It creates an S3 bucket for content storage and a CloudFront distribution to serve that content with low latency globally.

## Features

- **S3 Bucket**: Securely stores static website files
- **CloudFront Distribution**: Serves content with low latency from edge locations worldwide
- **Origin Access Identity**: Ensures S3 content is only accessible through CloudFront
- **Synced Folder Component**: Automatically syncs local files to S3 during deployment

## Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│    Users      │────▶│   CloudFront  │────▶│   S3 Bucket   │
│               │     │  Distribution │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                             │                      ▲
                             │                      │
                             ▼                      │
                      ┌───────────────┐     ┌───────────────┐
                      │  Origin       │     │  Bucket       │
                      │  Access       │────▶│  Policy       │
                      │  Identity     │     │               │
                      └───────────────┘     └───────────────┘
```

### Flow Description

1. **Users** request content from the CloudFront URL
2. **CloudFront Distribution** serves cached content or forwards requests to the origin
3. **Origin Access Identity** provides secure access to the S3 bucket
4. **Bucket Policy** ensures only CloudFront can access the S3 bucket content
5. **S3 Bucket** stores the static website files

### Components Created by Pulumi

- `aws.s3.BucketV2`: The S3 bucket that stores the website content
- `aws.cloudfront.OriginAccessIdentity`: Secures access to the S3 bucket
- `aws.s3.BucketPolicy`: Configures permissions for CloudFront access
- `aws.cloudfront.Distribution`: Distributes content globally with low latency
- `synced.S3BucketFolder`: Syncs local files to the S3 bucket during deployment

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [Pulumi ESC](https://www.pulumi.com/docs/pulumi-cloud/esc/) (optional, for credential management)

## Getting Started

1. Clone this repository:
   ```bash
   git clone https://github.com/cnunciato/hello-pulumi.git
   cd hello-pulumi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure AWS region:
   ```bash
   pulumi config set aws:region us-west-2
   ```

4. Deploy the infrastructure:
   ```bash
   pulumi up
   ```

5. After deployment, the CloudFront URL will be displayed in the outputs.

## Project Structure

- `index.ts`: The main Pulumi program that defines the infrastructure
- `website/`: Directory containing website files that are synced to S3
- `Pulumi.yaml` and `Pulumi.dev.yaml`: Pulumi project and stack configuration files

## Updating Content

To update the website content:

1. Modify files in the `website/` directory
2. Run `pulumi up` to deploy the changes
3. The Synced Folder component will automatically update the S3 bucket with your changes

## Cleaning Up

To remove all resources created by this project:

```bash
pulumi destroy
```

## License

MIT

## Acknowledgements

This project was inspired by Pulumi's examples and documentation on deploying static websites to AWS.
