import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {Construct} from 'constructs';

export class Network extends Construct {
    public readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.vpc = new ec2.Vpc(this, 'Vpc', {
            maxAzs: 2,
            natGateways: 0,
            subnetConfiguration: [
                {name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24},
                {name: 'Isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24},
            ],
        });
    }
}
