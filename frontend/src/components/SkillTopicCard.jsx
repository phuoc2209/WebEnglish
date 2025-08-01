import React from 'react';
import { Play, Clock, BookOpen, Users } from 'lucide-react';

const SkillTopicCard = ({ 
  topic, 
  skillType = 'listening', 
  onClick 
}) => {
  // Validate topic object
  if (!topic || typeof topic !== 'object') {
    console.error('Invalid topic prop:', topic);
    return null;
  }

  // Get safe values with defaults
  const safeTopic = {
    id: topic.id || topic._id || '',
    title: topic.title || 'Untitled Topic',
    description: topic.description || `Improve your ${skillType} skills with engaging exercises.`,
    level: topic.level || 'B1',
    duration: topic.duration || 30,
    lessonCount: topic.lessonCount || 0,
    progress: topic.progress || 0
  };

  const getSkillIcon = () => {
    switch (skillType) {
      case 'listening': return <Play className="w-5 h-5" />;
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'speaking': return <Users className="w-5 h-5" />;
      case 'writing': return <BookOpen className="w-5 h-5" />;
      default: return <Play className="w-5 h-5" />;
    }
  };

  const getSkillColor = () => {
    switch (skillType) {
      case 'listening': return 'from-blue-500 to-blue-600';
      case 'reading': return 'from-green-500 to-green-600';
      case 'speaking': return 'from-purple-500 to-purple-600';
      case 'writing': return 'from-orange-500 to-orange-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (typeof onClick === 'function' && safeTopic.id) {
      onClick({ ...topic, id: safeTopic.id });
    } else {
      console.warn('Invalid onClick handler or missing topic ID');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
    >
      {/* Header với gradient */}
      <div className={`bg-gradient-to-r ${getSkillColor()} p-4 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            {getSkillIcon()}
            <span className="font-medium capitalize">{skillType}</span>
          </div>
          <div className="bg-white/20 px-2 py-1 rounded-full">
            <span className="text-white text-sm font-medium">
              Level {safeTopic.level}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {safeTopic.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {safeTopic.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{safeTopic.duration} mins</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{safeTopic.lessonCount} lessons</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{safeTopic.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${getSkillColor()} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${safeTopic.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Action button */}
        <button 
          className={`w-full bg-gradient-to-r ${getSkillColor()} text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200`}
          onClick={handleClick}
        >
          {safeTopic.progress > 0 ? 'Continue Learning' : 'Start Learning'}
        </button>
      </div>
    </div>
  );
};

export default SkillTopicCard;