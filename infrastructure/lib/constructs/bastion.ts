import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {Construct} from 'constructs';

export interface BastionProps {
    vpc: ec2.Vpc;
}

export class Bastion extends Construct {
    public readonly host: ec2.BastionHostLinux;

    constructor(scope: Construct, id: string, props: BastionProps) {
        super(scope, id);

        // BastionHostLinux automatically attaches AmazonSSMManagedInstanceCore,
        // enabling SSM Session Manager access without any open inbound ports or SSH keys.
        // Default instance type is t3.nano (x86) — broad AZ availability
        this.host = new ec2.BastionHostLinux(this, 'Host', {
            vpc: props.vpc,
            subnetSelection: {subnetType: ec2.SubnetType.PUBLIC},
            // instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.NANO),
        });
    }
}
