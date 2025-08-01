import React from 'react';
import { Play, FileText, Mic, PenTool, Clock, CheckCircle, Circle } from 'lucide-react';

const SkillExerciseCard = ({ 
  exercise, 
  skillType = 'listening',
  onStart,
  isCompleted = false 
}) => {
  const getExerciseIcon = () => {
    switch (skillType) {
      case 'listening':
        return <Play className="w-5 h-5" />;
      case 'reading':
        return <FileText className="w-5 h-5" />;
      case 'speaking':
        return <Mic className="w-5 h-5" />;
      case 'writing':
        return <PenTool className="w-5 h-5" />;
      default:
        return <Play className="w-5 h-5" />;
    }
  };

  const getSkillColor = () => {
    switch (skillType) {
      case 'listening':
        return 'from-blue-500 to-blue-600';
      case 'reading':
        return 'from-green-500 to-green-600';
      case 'speaking':
        return 'from-purple-500 to-purple-600';
      case 'writing':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 bg-gradient-to-r ${getSkillColor()} rounded-lg text-white`}>
              {getExerciseIcon()}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 line-clamp-1">
                {exercise.title}
              </h4>
              <p className="text-sm text-gray-500">
                {exercise.type || 'Exercise'}
              </p>
            </div>
          </div>
          
          {/* Completion status */}
          <div className="flex items-center">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
          </div>
        </div>

        {/* Description */}
        {exercise.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {exercise.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex items-center gap-2 mb-4">
          {exercise.difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
              {exercise.difficulty}
            </span>
          )}
          
          {exercise.duration && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>{exercise.duration} min</span>
            </div>
          )}

          {exercise.questionCount && (
            <span className="text-xs text-gray-500">
              {exercise.questionCount} questions
            </span>
          )}
        </div>

        {/* Score (if completed) */}
        {isCompleted && exercise.score !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Your Score</span>
              <span className="font-medium">{exercise.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${exercise.score >= 80 ? 'bg-green-500' : exercise.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${exercise.score}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => onStart(exercise)}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white bg-gradient-to-r ${getSkillColor()} hover:shadow-md transition-all duration-200`}
        >
          {isCompleted ? 'Retry Exercise' : 'Start Exercise'}
        </button>
      </div>
    </div>
  );
};

export default SkillExerciseCard;