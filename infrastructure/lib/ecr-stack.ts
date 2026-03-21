import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import {Construct} from 'constructs';

export class EcrStack extends cdk.Stack {
    public readonly backendRepository: ecr.Repository;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.backendRepository = new ecr.Repository(this, 'BackendRepository', {
            repositoryName: 'movielearn-backend',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            emptyOnDelete: true,
            lifecycleRules: [{maxImageCount: 5}],
        });

        new cdk.CfnOutput(this, 'RepositoryUri', {
            value: this.backendRepository.repositoryUri,
        });
    }
}
