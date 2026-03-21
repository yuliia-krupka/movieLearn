import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import {Construct} from 'constructs';

export interface DatabaseProps {
    vpc: ec2.Vpc;
}

export class Database extends Construct {
    public readonly instance: rds.DatabaseInstance;

    constructor(scope: Construct, id: string, props: DatabaseProps) {
        super(scope, id);

        this.instance = new rds.DatabaseInstance(this, 'MySQL', {
            engine: rds.DatabaseInstanceEngine.mysql({version: rds.MysqlEngineVersion.VER_8_0}),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
            vpc: props.vpc,
            vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE_ISOLATED},
            databaseName: 'mvlearndb',
            credentials: rds.Credentials.fromGeneratedSecret('movielearn_admin'),
            allocatedStorage: 20,
            storageType: rds.StorageType.GP3,
            multiAz: false,
            backupRetention: cdk.Duration.days(1),
            deletionProtection: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            publiclyAccessible: false,
        });
    }
}
