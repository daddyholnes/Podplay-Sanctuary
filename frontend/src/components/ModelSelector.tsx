/**
 * Enhanced Model Selector Component
 * 
 * Provides a compact, scrollable model selection interface with rich hover tooltips
 * displaying pricing, capabilities, and detailed information. Integrates with live
 * API data for paid users and includes model logos.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  DollarSign, 
  Activity, 
  Clock, 
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
  Crown,
  Star,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AIModel } from '@/types';
import { fetchAllModels } from '@/lib/model-fetcher';
import { useThemeStore } from '@/stores';

interface ModelSelectorProps {
  selectedModel?: AIModel;
  onModelSelect: (model: AIModel) => void;
  className?: string;
  paidUser?: boolean;
  showHeader?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
  className = '',
  paidUser = false,
  showHeader = true
}) => {
  const { theme } = useThemeStore();
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Provider colors and priorities
  const getProviderConfig = (provider: string) => {
    switch (provider) {
      case 'openai':
        return {
          color: 'emerald',
          bgClass: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
          textClass: 'text-emerald-700 dark:text-emerald-300',
          iconClass: 'text-emerald-600 dark:text-emerald-400',
          hoverClass: 'hover:border-emerald-300 dark:hover:border-emerald-600'
        };
      case 'anthropic':
        return {
          color: 'orange',
          bgClass: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
          textClass: 'text-orange-700 dark:text-orange-300',
          iconClass: 'text-orange-600 dark:text-orange-400',
          hoverClass: 'hover:border-orange-300 dark:hover:border-orange-600'
        };
      case 'gemini':
        return {
          color: 'blue',
          bgClass: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
          textClass: 'text-blue-700 dark:text-blue-300',
          iconClass: 'text-blue-600 dark:text-blue-400',
          hoverClass: 'hover:border-blue-300 dark:hover:border-blue-600'
        };
      default:
        return {
          color: 'gray',
          bgClass: 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800',
          textClass: 'text-gray-700 dark:text-gray-300',
          iconClass: 'text-gray-600 dark:text-gray-400',
          hoverClass: 'hover:border-gray-300 dark:hover:border-gray-600'
        };
    }
  };

  // Load models on component mount
  useEffect(() => {
    loadModels();
    
    // Set up online/offline detection
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [paidUser]);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const fetchedModels = await fetchAllModels(paidUser);
      setModels(fetchedModels);
      setLastUpdated(new Date());
      
      // Auto-select first model if none selected
      if (!selectedModel && fetchedModels.length > 0) {
        onModelSelect(fetchedModels[0]);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshModels = () => {
    if (paidUser && isOnline) {
      loadModels();
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    if (price < 1) return `$${price.toFixed(3)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'new':
      case 'latest':
        return 'default' as const;
      case 'premium':
      case 'flagship':
        return 'destructive' as const;
      case 'fast':
      case 'efficient':
        return 'secondary' as const;
      case 'experimental':
      case 'preview':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
            </div>
          </div>
        )}
        <div className="p-3">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`${
        theme === 'light'
          ? 'bg-white/50 border-purple-200'
          : theme === 'dark'
          ? 'bg-slate-800/50 border-slate-700'
          : 'bg-purple-900/30 border-purple-600/30'
      } backdrop-blur-md border-b ${className}`}>
        {showHeader && (
          <div className="p-3 border-b border-inherit">
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-lg font-semibold ${
                theme === 'light' ? 'text-purple-800' : 'text-purple-100'
              }`}>
                AI Models
              </h2>
              
              <div className="flex items-center space-x-2">
                {paidUser && (
                  <Badge variant="outline" className="text-xs flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Pro</span>
                  </Badge>
                )}
                
                <Badge variant="outline" className="text-xs">
                  {models.length} available
                </Badge>
                
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                
                {paidUser && isOnline && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshModels}
                    className="h-6 w-6 p-0"
                    title="Refresh models"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {lastUpdated && (
              <p className={`text-xs ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
        
        <ScrollArea className="w-full">
          <div className="p-3">
            <div className="flex space-x-2 pb-2">
              {models.map((model, index) => {
                const isSelected = selectedModel?.id === model.id;
                const providerConfig = getProviderConfig(model.provider);
                
                return (
                  <Tooltip key={model.id} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => onModelSelect(model)}
                          className={`min-w-fit whitespace-nowrap relative transition-all duration-200 h-10 px-3 ${
                            isSelected
                              ? `${providerConfig.bgClass} ${providerConfig.textClass} border-2`
                              : `hover:${providerConfig.bgClass} ${providerConfig.hoverClass} border`
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {/* Model Logo or Icon */}
                            {model.logo ? (
                              <img 
                                src={model.logo} 
                                alt={model.name}
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                  // Fallback to icon if logo fails to load
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Zap className={`w-4 h-4 ${
                                isSelected ? providerConfig.iconClass : 'text-gray-500'
                              }`} />
                            )}
                            
                            {/* Model Name - Compact */}
                            <span className="text-xs font-medium truncate max-w-20">
                              {model.name.split(' ').slice(0, 2).join(' ')}
                            </span>
                            
                            {/* Top Badge */}
                            {model.badges && model.badges.length > 0 && (
                              <Badge 
                                variant={getBadgeVariant(model.badges[0])}
                                className="text-xs px-1 py-0 h-4"
                              >
                                {model.badges[0]}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    
                    <TooltipContent side="bottom" className="w-80 p-0">
                      <Card className="shadow-xl border-2 m-0">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {model.logo && (
                                <img 
                                  src={model.logo} 
                                  alt={model.name}
                                  className="w-6 h-6 object-contain"
                                />
                              )}
                              <div>
                                <h4 className="font-semibold text-sm">{model.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${providerConfig.textClass}`}
                                  >
                                    {model.provider.toUpperCase()}
                                  </Badge>
                                  {model.badges?.map((badge) => (
                                    <Badge 
                                      key={badge} 
                                      variant={getBadgeVariant(badge)}
                                      className="text-xs"
                                    >
                                      {badge}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 space-y-3">
                          {/* Capabilities */}
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>Best for:</span>
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {model.capabilities.map((capability) => (
                                <Badge 
                                  key={capability} 
                                  variant="outline" 
                                  className="text-xs py-0 px-1"
                                >
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Pricing & Performance */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="flex items-center space-x-1 mb-1">
                                <DollarSign className="w-3 h-3" />
                                <span className="font-medium">Pricing</span>
                              </div>
                              <div className="space-y-0.5">
                                <p>Input: {formatPrice(model.pricing.input)}/1M</p>
                                <p>Output: {formatPrice(model.pricing.output)}/1M</p>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-1 mb-1">
                                <Activity className="w-3 h-3" />
                                <span className="font-medium">Limits</span>
                              </div>
                              <div className="space-y-0.5">
                                <p>{formatNumber(model.rate_limits.rpm)} RPM</p>
                                {model.rate_limits.rpd && (
                                  <p>{formatNumber(model.rate_limits.rpd)} RPD</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Context & Knowledge */}
                          <div className="flex items-center justify-between text-xs pt-2 border-t">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatNumber(model.context_length)} tokens</span>
                            </div>
                            
                            {model.knowledge_cutoff && (
                              <div className="flex items-center space-x-1 text-gray-500">
                                <TrendingUp className="w-3 h-3" />
                                <span>Updated: {model.knowledge_cutoff}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Value Indicator */}
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">Value Rating:</span>
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const rating = Math.min(5, Math.max(1, 
                                    5 - (model.pricing.input + model.pricing.output) / 10
                                  ));
                                  return (
                                    <Star 
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= rating 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default ModelSelector;