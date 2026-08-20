import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

const MODEL_NAME = 'Xenova/distilgpt2';

async function testCandidateModel() {
  console.log(`=== TESTING CANDIDATE MODEL: ${MODEL_NAME} ===`);
  const startTotal = Date.now();

  try {
    console.log(`Loading ONNX model weights for ${MODEL_NAME}...`);
    const generator = await pipeline('text-generation', MODEL_NAME);

    // PROMPT 1
    const prompt1 = 'Question: What is PCOS? Explain it in 2 simple sentences.\nAnswer:';
    console.log('\n--- PROMPT 1 TEST ---');
    console.log('Prompt:', prompt1);
    
    const startP1 = Date.now();
    const res1 = await generator(prompt1, {
      max_new_tokens: 80,
      temperature: 0.3,
      repetition_penalty: 1.2,
      do_sample: false
    });
    const timeP1 = ((Date.now() - startP1) / 1000).toFixed(2);

    const text1 = res1[0]?.generated_text || '';
    console.log(`Inference Time (Prompt 1): ${timeP1}s`);
    console.log('Raw Generated Response 1:');
    console.log(text1);

    // PROMPT 2
    const prompt2 = 'Question: What does a high TSH generally indicate?\nAnswer:';
    console.log('\n--- PROMPT 2 TEST ---');
    console.log('Prompt:', prompt2);

    const startP2 = Date.now();
    const res2 = await generator(prompt2, {
      max_new_tokens: 80,
      temperature: 0.3,
      repetition_penalty: 1.2,
      do_sample: false
    });
    const timeP2 = ((Date.now() - startP2) / 1000).toFixed(2);

    const text2 = res2[0]?.generated_text || '';
    console.log(`Inference Time (Prompt 2): ${timeP2}s`);
    console.log('Raw Generated Response 2:');
    console.log(text2);

    const totalElapsed = ((Date.now() - startTotal) / 1000).toFixed(2);
    console.log(`\n=== CANDIDATE TEST COMPLETED IN ${totalElapsed}s ===`);

  } catch (err) {
    console.error(`Error testing candidate model ${MODEL_NAME}:`, err);
  }
}

testCandidateModel();
