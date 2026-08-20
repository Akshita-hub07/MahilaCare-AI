import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

async function runLocalInferenceTest() {
  console.log('--- STARTING LOCAL NEURAL MODEL INFERENCE TEST ---');
  const startTime = Date.now();

  try {
    console.log('Loading local ONNX neural model (Xenova/LaMini-GPT-124M)...');
    const generator = await pipeline('text-generation', 'Xenova/LaMini-GPT-124M');
    
    const prompt = 'Question: What is PCOS?\nAnswer:';
    console.log(`Input Prompt:\n"${prompt}"`);
    console.log('Running neural tensor inference...');

    const result = await generator(prompt, {
      max_new_tokens: 80,
      temperature: 0.3,
      repetition_penalty: 1.2,
      do_sample: false
    });

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`--- INFERENCE COMPLETED IN ${elapsedSec}s ---`);
    console.log('Generated Output:');
    console.log(result[0]?.generated_text);
    console.log('--------------------------------------------------');

  } catch (err) {
    console.error('Local Model Inference Error:', err);
  }
}

runLocalInferenceTest();
