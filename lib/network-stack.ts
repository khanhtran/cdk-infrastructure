import { CfnOutput, Tag, Aspects, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class NetworkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "vpc", {
      cidr: "10.0.0.0/16",
      vpcName: "app-vpc",
      natGateways: 0,
      maxAzs: 1,
      subnetConfiguration: [
        {
          name: "app-public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // 👇 update the Name tag for public subnets
    for (const subnet of vpc.publicSubnets) {
      Aspects.of(subnet).add(
        new Tag(
          "Name",
          `${vpc.node.id}-${subnet.node.id.replace(/Subnet[0-9]$/, "")}-${
            subnet.availabilityZone
          }`
        )
      );
    }

    const appSG = new ec2.SecurityGroup(this, 'app-sg', {
      securityGroupName: 'app-security-group',
      vpc,
      allowAllOutbound: true,
      description: 'security group for a web server',
    });

    appSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere',
    );

    new CfnOutput(this, "vpc-output", {
      exportName: "appVpcId",
      value: vpc.vpcId,
    });
    new CfnOutput(this, "az-output", {
      exportName: "appVpcAzs",
      value: vpc.availabilityZones.join(',')
    });
    new CfnOutput(this, "sg-output", {
      exportName: "appSecurityGroupId",
      value: appSG.securityGroupId,
    });
    new CfnOutput(this, `public-subnets-output`, {
      exportName: `appPublicSubnetIds`,
      value: vpc.publicSubnets.map(s => s.subnetId).join(',')
    });
  }
}
