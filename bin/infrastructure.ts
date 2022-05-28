#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { EC2Stack } from '../lib/ec2-stack';

const app = new cdk.App();
new NetworkStack(app, 'Network', {  
});

new EC2Stack(app, 'EC2', {  
});