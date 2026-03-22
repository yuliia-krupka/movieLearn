#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/ecr-stack';
import { MovieLearnStack } from '../lib/movielearn-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new EcrStack(app, 'EcrStack', { env });
new MovieLearnStack(app, 'MovieLearnStack', { env });
