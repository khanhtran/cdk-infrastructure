import { Construct } from "constructs";
import { Fn } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";


export interface AppInstanceProps {
  instanceName: string;
  instanceType?: string;
  userData: string;
}

export class AppInstance extends Construct {
  constructor(scope: Construct, id: string, props: AppInstanceProps) {
    super(scope, id);
    const vpc = ec2.Vpc.fromVpcAttributes(this, `${id}-vpc`, {
      vpcId: Fn.importValue("appVpcId"),
      availabilityZones: Fn.importValue("appVpcAzs").split(","),
    });

    const instance = new ec2.Instance(this, `instance-${id}`, {
      instanceName: props.instanceName,
      instanceType: new ec2.InstanceType(props.instanceType ?? "t2.micro"),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpc: vpc,
      vpcSubnets: {
        subnets: Fn.importValue("appPublicSubnetIds")
          .split(",")
          .map((value, index, arr) =>
            ec2.Subnet.fromSubnetAttributes(this, `${id}-subnet${index}`, {
              subnetId: value,
              availabilityZone: "us-east-2a",
            })
          ),
      },
      securityGroup: ec2.SecurityGroup.fromSecurityGroupId(
        this,
        "sg",
        Fn.importValue("appSecurityGroupId")
      ),
      userData: this.userData(props),
    })
  }

  private userData(props: AppInstanceProps): ec2.UserData {
    const data = ec2.UserData.forLinux();
    data.addCommands(`echo ${props.instanceName} > /etc/hostname && reboot`);
    data.addCommands(props.userData)
    return data;
  }
}
