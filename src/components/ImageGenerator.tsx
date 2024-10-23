import React, { useState } from 'react';
import { Upload, Plus } from 'lucide-react';
import { useTokens } from '../hooks/useTokens';

const ImageGenerator = ({ showAdvancedSettings }: { showAdvancedSettings: boolean }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [promptStrength, setPromptStrength] = useState(0.8);
  const [numOutputs, setNumOutputs] = useState(1);
  const [numInferenceSteps, setNumInferenceSteps] = useState(28);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [seed, setSeed] = useState(0);
  const [hfLoras, setHfLoras] = useState(['']);
  const [loraScales, setLoraScales] = useState(['']);
  const [image, setImage] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const { tokens, useTokens: spendTokens, IMAGE_GENERATION_COST } = useTokens();

  const aspectRatios = ['1:1', '16:9', '21:9', '3:2', '2:3', '4:5', '5:4', '3:4', '4:3', '9:16', '9:21'];

  const handleGenerate = async () => {
    const totalCost = IMAGE_GENERATION_COST * numOutputs;
    if (await spendTokens(totalCost)) {
      const input = {
        seed: seed,
        image: image,
        prompt: prompt,
        hf_loras: hfLoras.filter(lora => lora !== ''),
        lora_scales: loraScales.filter(scale => scale !== '').map(Number),
        num_outputs: numOutputs,
        aspect_ratio: aspectRatio,
        output_format: "jpg",
        guidance_scale: guidanceScale,
        output_quality: 100,
        prompt_strength: promptStrength,
        num_inference_steps: numInferenceSteps
      };

      try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
          },
          body: JSON.stringify({
            version: "2389224e115448d9a77c07d7d45672b3f0aa45acacf1c5bcf51857ac295e3aec",
            input: input,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        const result = await response.json();
        
        // Poll for the result
        const pollInterval = setInterval(async () => {
          const pollResponse = await fetch(result.urls.get, {
            headers: {
              'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
            },
          });
          const pollResult = await pollResponse.json();
          
          if (pollResult.status === 'succeeded') {
            clearInterval(pollInterval);
            setGeneratedImage(pollResult.output[0]);
          } else if (pollResult.status === 'failed') {
            clearInterval(pollInterval);
            console.error('Image generation failed:', pollResult.error);
          }
        }, 1000);
      } catch (error) {
        console.error('Error generating image:', error);
      }
    } else {
      alert('Not enough tokens. Please purchase more.');
    }
  };

  const handleAddLora = () => {
    setHfLoras([...hfLoras, '']);
    setLoraScales([...loraScales, '']);
  };

  const handleLoraChange = (index: number, value: string) => {
    const newLoras = [...hfLoras];
    newLoras[index] = value;
    setHfLoras(newLoras);
  };

  const handleLoraScaleChange = (index: number, value: string) => {
    const newScales = [...loraScales];
    newScales[index] = value;
    setLoraScales(newScales);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="mb-4">
        <textarea
          className="w-full bg-gray-700 text-white rounded-lg p-3 resize-none"
          rows={4}
          placeholder="Enter your prompt here"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-between mt-2">
          <label className="text-teal-400 hover:text-teal-300 cursor-pointer">
            <Upload className="inline mr-1" size={18} />
            Upload
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
          <button 
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleGenerate}
            disabled={tokens < IMAGE_GENERATION_COST * numOutputs}
          >
            Generate ▶ ({(IMAGE_GENERATION_COST * numOutputs).toFixed(1)} tokens)
          </button>
        </div>
      </div>

      {showAdvancedSettings && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
            <select
              className="w-full bg-gray-700 text-white rounded p-2"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
            >
              {aspectRatios.map((ratio) => (
                <option key={ratio} value={ratio}>{ratio}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prompt Strength: {promptStrength}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={promptStrength}
              onChange={(e) => setPromptStrength(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Outputs: {numOutputs}</label>
            <input
              type="range"
              min="1"
              max="4"
              value={numOutputs}
              onChange={(e) => setNumOutputs(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Inference Steps: {numInferenceSteps}</label>
            <input
              type="range"
              min="0"
              max="50"
              value={numInferenceSteps}
              onChange={(e) => setNumInferenceSteps(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Guidance Scale: {guidanceScale}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={guidanceScale}
              onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Seed</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white rounded p-2"
              placeholder="Enter seed"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">HF Loras</label>
            {hfLoras.map((lora, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={lora}
                  onChange={(e) => handleLoraChange(index, e.target.value)}
                  className="w-2/3 bg-gray-700 text-white rounded-l p-2"
                  placeholder="Enter Lora URL"
                />
                <input
                  type="text"
                  value={loraScales[index]}
                  onChange={(e) => handleLoraScaleChange(index, e.target.value)}
                  className="w-1/3 bg-gray-700 text-white rounded-r p-2"
                  placeholder="Lora Scale"
                />
              </div>
            ))}
            <button
              className="text-teal-400 hover:text-teal-300 flex items-center"
              onClick={handleAddLora}
            >
              <Plus className="mr-1" size={18} />
              Add Lora
            </button>
          </div>
        </div>
      )}

      {generatedImage && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Generated Image:</h3>
          <img src={generatedImage} alt="Generated" className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;