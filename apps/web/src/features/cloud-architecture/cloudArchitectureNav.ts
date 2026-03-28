export interface CloudArchitectureNavItem {
  label: string
  /** Set when a lesson exists in cloud-architecture.json */
  slug?: string
}

export interface CloudArchitectureNavSection {
  id: string
  title: string
  blurb: string
  items: CloudArchitectureNavItem[]
}

export const CLOUD_ARCHITECTURE_SECTIONS: CloudArchitectureNavSection[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Core building blocks of cloud environments and how systems run on them.',
    items: [
      { label: 'What is the Cloud?' },
      { label: 'Regions and Availability Zones' },
      { label: 'Shared Responsibility Model' },
      { label: 'Infrastructure as a Service (IaaS)' },
      { label: 'Platform vs Serverless' },
      { label: 'Infrastructure as Code (Terraform Basics)' },
    ],
  },
  {
    id: 'networking',
    title: 'Networking',
    blurb: 'How traffic flows through your system and how services communicate.',
    items: [
      { label: 'Virtual Private Cloud (VPC)', slug: 'vpc' },
      { label: 'Public vs Private Subnets', slug: 'public-private-subnets' },
      { label: 'Internet Gateway' },
      { label: 'NAT Gateway' },
      { label: 'Route Tables' },
      { label: 'Security Groups' },
      { label: 'Network ACLs' },
      { label: 'Load Balancer (L4 vs L7)', slug: 'load-balancer-l4-l7' },
      { label: 'DNS and Domain Routing' },
      { label: 'Private Networking Between Services' },
    ],
  },
  {
    id: 'compute',
    title: 'Compute',
    blurb: 'Where your application logic runs.',
    items: [
      { label: 'Virtual Machines (EC2)' },
      { label: 'Containers (Docker Basics)' },
      { label: 'Container Orchestration (ECS/EKS)' },
      { label: 'Serverless Functions (Lambda)', slug: 'serverless-lambda' },
      { label: 'Autoscaling' },
      { label: 'Stateless vs Stateful Compute' },
      { label: 'Background Workers' },
    ],
  },
  {
    id: 'storage',
    title: 'Storage',
    blurb: 'How data is stored, accessed, and distributed.',
    items: [
      { label: 'Object Storage (S3)', slug: 'object-storage-s3' },
      { label: 'Block Storage (EBS)' },
      { label: 'File Storage (EFS)' },
      { label: 'Storage Classes (Hot vs Cold)' },
      { label: 'CDN (CloudFront)' },
      { label: 'Pre-Signed URLs' },
      { label: 'Data Lifecycle Policies' },
    ],
  },
  {
    id: 'databases-cloud',
    title: 'Databases (Cloud)',
    blurb: 'Managed database systems and tradeoffs in the cloud.',
    items: [
      { label: 'Managed SQL Databases (RDS)' },
      { label: 'NoSQL Databases (DynamoDB)' },
      { label: 'Read Replicas' },
      { label: 'Multi-AZ Deployments' },
      { label: 'Backups and Snapshots' },
      { label: 'Connection Pooling' },
      { label: 'Scaling Databases' },
    ],
  },
  {
    id: 'messaging',
    title: 'Messaging & Async Systems',
    blurb: 'Decoupling systems and handling asynchronous workloads.',
    items: [
      { label: 'Queue (SQS)', slug: 'queue-sqs' },
      { label: 'Pub/Sub (SNS)' },
      { label: 'Event-Driven Architecture' },
      { label: 'Message Retry and Dead Letter Queues' },
      { label: 'Stream Processing (Kafka/Kinesis)' },
      { label: 'Task Queues and Workers' },
    ],
  },
  {
    id: 'security',
    title: 'Security & Identity',
    blurb: 'Controlling access and protecting systems.',
    items: [
      { label: 'Identity and Access Management (IAM)' },
      { label: 'Roles vs Policies' },
      { label: 'Least Privilege Principle' },
      { label: 'Secrets Management' },
      { label: 'API Authentication (Tokens, Keys)' },
      { label: 'TLS / HTTPS' },
      { label: 'Network Security Layers' },
    ],
  },
  {
    id: 'observability',
    title: 'Observability',
    blurb: 'Understanding system behavior in production.',
    items: [
      { label: 'Logging' },
      { label: 'Metrics' },
      { label: 'Monitoring Dashboards' },
      { label: 'Alerting' },
      { label: 'Distributed Tracing' },
      { label: 'Debugging Production Systems' },
    ],
  },
  {
    id: 'scalability',
    title: 'Scalability & Performance',
    blurb: 'Designing systems that handle growth and load.',
    items: [
      { label: 'Horizontal vs Vertical Scaling' },
      { label: 'Load Balancing Strategies' },
      { label: 'Caching in the Cloud' },
      { label: 'Rate Limiting' },
      { label: 'Backpressure' },
      { label: 'Thundering Herd Problem' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Architecture',
    blurb: 'Real-world distributed system patterns.',
    items: [
      { label: 'Multi-Region Architecture' },
      { label: 'Failover Strategies' },
      { label: 'Blue/Green Deployments' },
      { label: 'Canary Deployments' },
      { label: 'Circuit Breaker Pattern' },
      { label: 'Service Mesh' },
      { label: 'Chaos Engineering' },
    ],
  },
]
