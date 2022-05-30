import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppInstance } from "./construct/app-instance";
import { readFileSync } from "fs";

export class EC2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new AppInstance(this, 'eks-master', {
      instanceName: 'master',
      userData: readFileSync('./scripts/kube-master.sh', 'utf-8')
    })

    new AppInstance(this, 'eks-worker1', {
      instanceName: 'worker1',
      userData: readFileSync('./scripts/kube-worker.sh', 'utf-8')
    })
  }
}
