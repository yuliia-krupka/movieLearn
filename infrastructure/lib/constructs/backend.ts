import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import {Construct} from 'constructs';

export interface BackendProps {
    vpc: ec2.Vpc;
    database: rds.DatabaseInstance;
    repository: ecr.IRepository;
    imageTag?: string;
}

export class Backend extends Construct {
    public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
    public readonly fargateService: ecs_patterns.ApplicationLoadBalancedFargateService;

    constructor(scope: Construct, id: string, props: BackendProps) {
        super(scope, id);

        // App secrets from environment variables
        const requiredEnvVars = ['CLIENT_ID', 'CLIENT_SECRET', 'OPENAI_KEY'] as const;
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        }

        const appSecrets = new secretsmanager.Secret(this, 'AppSecrets', {
            secretName: 'movielearn/app-secrets',
            secretObjectValue: {
                CLIENT_ID: cdk.SecretValue.unsafePlainText(process.env.CLIENT_ID!),
                CLIENT_SECRET: cdk.SecretValue.unsafePlainText(process.env.CLIENT_SECRET!),
                OPENAI_KEY: cdk.SecretValue.unsafePlainText(process.env.OPENAI_KEY!),
            },
        });

        const rdsSecret = props.database.secret!;

        const cluster = new ecs.Cluster(this, 'Cluster', {
            vpc: props.vpc,
            clusterName: 'movielearn-cluster',
        });

        this.fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Service', {
            cluster,
            cpu: 512,
            memoryLimitMiB: 1024,
            desiredCount: 1,
            assignPublicIp: true,
            publicLoadBalancer: true,
            listenerPort: 80,
            runtimePlatform: {
                cpuArchitecture: ecs.CpuArchitecture.ARM64,
                operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
            },
            taskSubnets: {subnetType: ec2.SubnetType.PUBLIC},
            taskImageOptions: {
                // image: ecs.ContainerImage.fromAsset('../backend', {
                //           platform: ecr_assets.Platform.LINUX_ARM64,
                //
                //    }),
                image: ecs.ContainerImage.fromEcrRepository(props.repository, props.imageTag ?? 'latest'),
                containerPort: 8080,
                environment: {
                    SPRING_PROFILES_ACTIVE: 'aws',
                    SPRING_DATASOURCE_URL: `jdbc:mysql://${props.database.dbInstanceEndpointAddress}:3306/mvlearndb?allowMultiQueries=true`,
                },
                secrets: {
                    DB_USER: ecs.Secret.fromSecretsManager(rdsSecret, 'username'),
                    DB_PASSWORD: ecs.Secret.fromSecretsManager(rdsSecret, 'password'),
                    CLIENT_ID: ecs.Secret.fromSecretsManager(appSecrets, 'CLIENT_ID'),
                    CLIENT_SECRET: ecs.Secret.fromSecretsManager(appSecrets, 'CLIENT_SECRET'),
                    OPENAI_KEY: ecs.Secret.fromSecretsManager(appSecrets, 'OPENAI_KEY'),
                },
                logDriver: ecs.LogDrivers.awsLogs({
                    streamPrefix: 'movielearn-backend',
                    logRetention: logs.RetentionDays.ONE_WEEK,
                }),
            },
        });

        // Health check
        this.fargateService.targetGroup.configureHealthCheck({
            path: '/actuator/health',
            healthyThresholdCount: 2,
            unhealthyThresholdCount: 3,
            interval: cdk.Duration.seconds(30),
            timeout: cdk.Duration.seconds(5),
        });
        this.fargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '30');

        // Allow ECS tasks to access RDS
        props.database.connections.allowFrom(this.fargateService.service, ec2.Port.tcp(3306), 'Allow MySQL from Fargate');

        this.loadBalancer = this.fargateService.loadBalancer;
    }
}
