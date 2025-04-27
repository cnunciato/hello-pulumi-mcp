import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as synced from "@pulumi/synced-folder";
import * as path from "path";

// Create an S3 bucket for hosting content
const contentBucket = new aws.s3.BucketV2("content-bucket", {
    tags: {
        Name: "content-bucket",
    },
});

// Create a synced folder to automatically sync local files to the S3 bucket
const syncedFolder = new synced.S3BucketFolder("synced-website", {
    path: path.join(__dirname, "website"),
    bucketName: contentBucket.bucket,
    acl: "private", // Keep files private since we're using CloudFront with OAI
    managedObjects: true, // Automatically manage objects in the bucket
});

// Create an origin access identity for CloudFront to access the bucket
const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity("originAccessIdentity", {
    comment: "Access S3 bucket content only through CloudFront",
});

// Create a bucket policy that allows CloudFront to access the bucket
const bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
    bucket: contentBucket.id,
    policy: pulumi.all([contentBucket.arn, originAccessIdentity.iamArn]).apply(
        ([bucketArn, oaiIamArn]) => JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Effect: "Allow",
                Principal: {
                    AWS: oaiIamArn,
                },
                Action: "s3:GetObject",
                Resource: `${bucketArn}/*`,
            }],
        })
    ),
});

// Create a CloudFront distribution to serve the S3 bucket contents
const distribution = new aws.cloudfront.Distribution("distribution", {
    enabled: true,
    origins: [{
        domainName: contentBucket.bucketRegionalDomainName,
        originId: contentBucket.id,
        s3OriginConfig: {
            originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath,
        },
    }],
    defaultRootObject: "index.html",
    defaultCacheBehavior: {
        targetOriginId: contentBucket.id,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],
        forwardedValues: {
            queryString: false,
            cookies: {
                forward: "none",
            },
        },
        minTtl: 0,
        defaultTtl: 3600,
        maxTtl: 86400,
    },
    priceClass: "PriceClass_100",
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
});

// Export the names and URLs of the resources
export const bucketName = contentBucket.id;
export const bucketArn = contentBucket.arn;
export const distributionId = distribution.id;
export const distributionDomainName = distribution.domainName;
