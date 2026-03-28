import type { CurriculumNavSection } from '@/types/curriculumNav'

/**
 * Training, neural architectures, retrieval, and serving — distinct from exploratory
 * Data Science (Python, SQL, viz, BI). Math foundations for DS stay under Data Science → Mathematics.
 */
export const AI_SYSTEMS_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'machine-learning',
    title: 'Machine learning',
    blurb:
      'Classical learning from tabular and structured data — complements statistics and feature work in Data Science.',
    items: [
      { label: 'Supervised Learning' },
      { label: 'Unsupervised Learning' },
      { label: 'Regression Techniques' },
      { label: 'Gradient Descent' },
      { label: 'Regularization' },
      { label: 'Classification Algorithms' },
      { label: 'Clustering' },
      { label: 'Dimensionality Reduction' },
      { label: 'Evaluation Metrics' },
      { label: 'Cross-validation' },
      { label: 'Hyperparameter tuning' },
      { label: 'Tree-Based Models' },
      { label: 'Ensemble Learning' },
    ],
  },
  {
    id: 'deep-learning',
    title: 'Deep learning',
    blurb:
      'Neural architectures for vision, language, and sequence tasks — pairs with representation and serving sections below.',
    items: [
      { label: 'Neural Networks' },
      { label: 'Artificial Neural Networks (ANNs)' },
      { label: 'Perceptron' },
      { label: 'Optimization Algorithms' },
      { label: 'Convolutional Neural Networks (CNN)' },
      { label: 'Transfer learning' },
      { label: 'Recurrent Neural Networks (RNN)' },
      { label: 'LSTM & GRU' },
      { label: 'Transformers' },
      { label: 'Seq2Seq' },
      { label: 'Autoencoders' },
      { label: 'Generative Adversarial Network (GAN)' },
      { label: 'Deep Learning Frameworks' },
    ],
  },
  {
    id: 'representations',
    title: 'Representations & retrieval',
    blurb:
      'Dense vectors and specialized stores for search and grounding — bridges models to production RAG.',
    items: [
      { label: 'Embeddings' },
      { label: 'Vector databases' },
    ],
  },
  {
    id: 'production',
    title: 'Production patterns',
    blurb: 'Operating models as services — latency, freshness, and safety in real systems.',
    items: [
      { label: 'RAG systems' },
      { label: 'Model serving' },
    ],
  },
]

export const AI_SYSTEMS_DEFAULT_OPEN = [
  'machine-learning',
  'deep-learning',
  'representations',
  'production',
] as const
