import React, { useState } from 'react';
import { Plus, Trash2, Palette, Zap } from 'lucide-react';
import { AnimationEffect } from '../types';

interface EffectSelectorProps {
  effects: AnimationEffect[];
  onEffectsChange: (effects: AnimationEffect[]) => void;
}

const defaultEffects: Omit<AnimationEffect, 'id'>[] = [
  {
    name: '波浪效果',
    type: 'wave',
    intensity: 0.8,
    color: '#3b82f6',
    speed: 1.0,
    size: 1.0
  },
  {
    name: '粒子效果',
    type: 'particle',
    intensity: 0.6,
    color: '#ef4444',
    speed: 1.2,
    size: 0.8
  },
  {
    name: '幾何效果',
    type: 'geometric',
    intensity: 0.7,
    color: '#10b981',
    speed: 0.8,
    size: 1.2
  },
  {
    name: '流體效果',
    type: 'fluid',
    intensity: 0.9,
    color: '#8b5cf6',
    speed: 1.1,
    size: 1.0
  },
  {
    name: '神經網絡',
    type: 'neural',
    intensity: 0.5,
    color: '#f59e0b',
    speed: 0.9,
    size: 0.9
  }
];

export const EffectSelector: React.FC<EffectSelectorProps> = ({
  effects,
  onEffectsChange
}) => {
  const [selectedEffect, setSelectedEffect] = useState<AnimationEffect | null>(null);

  const addEffect = (effectTemplate: Omit<AnimationEffect, 'id'>) => {
    const newEffect: AnimationEffect = {
      ...effectTemplate,
      id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    onEffectsChange([...effects, newEffect]);
  };

  const removeEffect = (effectId: string) => {
    onEffectsChange(effects.filter(e => e.id !== effectId));
    if (selectedEffect?.id === effectId) {
      setSelectedEffect(null);
    }
  };

  const updateEffect = (updatedEffect: AnimationEffect) => {
    onEffectsChange(effects.map(e => e.id === updatedEffect.id ? updatedEffect : e));
    setSelectedEffect(updatedEffect);
  };

  const getEffectIcon = (type: AnimationEffect['type']) => {
    switch (type) {
      case 'wave': return '🌊';
      case 'particle': return '✨';
      case 'geometric': return '🔷';
      case 'fluid': return '💧';
      case 'neural': return '🧠';
      default: return '🎨';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">視覺效果</h3>
      
      {/* 添加效果按鈕 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {defaultEffects.map((effect, index) => (
            <button
              key={index}
              onClick={() => addEffect(effect)}
              className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <span className="text-2xl">{getEffectIcon(effect.type)}</span>
              <span className="text-sm font-medium text-gray-700">{effect.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 已添加的效果列表 */}
      {effects.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-700">已添加的效果</h4>
          {effects.map((effect) => (
            <div
              key={effect.id}
              className={`p-4 border rounded-lg transition-colors ${
                selectedEffect?.id === effect.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedEffect(effect)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getEffectIcon(effect.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{effect.name}</div>
                    <div className="text-sm text-gray-600">
                      強度: {Math.round(effect.intensity * 100)}% | 
                      速度: {effect.speed.toFixed(1)}x | 
                      大小: {effect.size.toFixed(1)}x
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEffect(effect.id);
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 效果參數調整 */}
      {selectedEffect && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-700 mb-4">調整參數</h4>
          
          <div className="space-y-4">
            {/* 強度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                強度: {Math.round(selectedEffect.intensity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedEffect.intensity}
                onChange={(e) => updateEffect({
                  ...selectedEffect,
                  intensity: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 速度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                速度: {selectedEffect.speed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedEffect.speed}
                onChange={(e) => updateEffect({
                  ...selectedEffect,
                  speed: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 大小 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                大小: {selectedEffect.size.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedEffect.size}
                onChange={(e) => updateEffect({
                  ...selectedEffect,
                  size: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 顏色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                顏色
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={selectedEffect.color}
                  onChange={(e) => updateEffect({
                    ...selectedEffect,
                    color: e.target.value
                  })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{selectedEffect.color}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
