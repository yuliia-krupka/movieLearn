import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import {Construct} from 'constructs';
import {Network} from './constructs/network';
import {Database} from './constructs/database';
import {Backend} from './constructs/backend';
import {Frontend} from './constructs/frontend';

export class MovieLearnStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Import ECR repository created by EcrStack
        const repository = ecr.Repository.fromRepositoryName(this, 'BackendRepo', 'movielearn-backend');

        const network = new Network(this, 'Network');

        const database = new Database(this, 'Database', {
            vpc: network.vpc,
        });

        const imageTag = process.env.IMAGE_TAG ?? 'latest';

        const backend = new Backend(this, 'Backend', {
            vpc: network.vpc,
            database: database.instance,
            repository,
            imageTag,
        });

        const frontend = new Frontend(this, 'Frontend', {
            loadBalancer: backend.loadBalancer,
        });

        // Set FRONTEND_URL on ECS task with the CloudFront domain
        backend.fargateService.taskDefinition.defaultContainer!.addEnvironment(
            'FRONTEND_URL',
            `https://${frontend.distribution.distributionDomainName}`,
        );

        // Outputs
        new cdk.CfnOutput(this, 'CloudFrontUrl', {
            value: `https://${frontend.distribution.distributionDomainName}`,
        });
        new cdk.CfnOutput(this, 'AlbDnsName', {
            value: backend.loadBalancer.loadBalancerDnsName,
        });
        new cdk.CfnOutput(this, 'RdsEndpoint', {
            value: database.instance.dbInstanceEndpointAddress,
        });
        new cdk.CfnOutput(this, 'EcrRepositoryUri', {
            value: repository.repositoryUri,
        });
    }
}
