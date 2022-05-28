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
      maxAzs: 2,
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

    new CfnOutput(this, "vpc-output", {
      exportName: "appVpcId",
      value: vpc.vpcId,
    });
    vpc.publicSubnets.forEach((subnet, index) => {
      new CfnOutput(this, `public-subnet-output-${index}`, {
        exportName: `appPublicSubnetId${index}`,
        value: subnet.subnetId,
      });
    });
  }
}
