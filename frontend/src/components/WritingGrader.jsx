import React, { useState } from 'react';
import { gradeWriting } from '../services/ai.service';
import LoadingSpinner from './LoadingSpinner';

const WritingGrader = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!text.trim()) return setError('Vui lòng nhập đoạn văn');
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await gradeWriting(text);
            setResult(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">AI Chấm điểm Writing</h2>
            <textarea
                className="w-full border rounded p-3 mb-4 min-h-[120px]"
                placeholder="Nhập đoạn văn tiếng Anh của bạn..."
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded font-semibold mb-4"
                disabled={loading || !text.trim()}
            >
                Chấm điểm
            </button>
            {loading && <LoadingSpinner />}
            {error && <div className="text-red-600 mt-2">{error}</div>}
            {result && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Kết quả AI chấm điểm:</h3>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>Ngữ pháp: <b>{result.grammarScore}/10</b></div>
                        <div>Từ vựng: <b>{result.vocabularyScore}/10</b></div>
                        <div>Mạch lạc: <b>{result.coherenceScore}/10</b></div>
                        <div>Cấu trúc: <b>{result.structureScore}/10</b></div>
                        <div className="col-span-2">Tổng thể: <b>{result.overall}/10</b></div>
                    </div>
                    <div className="mt-2"><b>Feedback:</b> <span className="text-green-700">{result.feedback}</span></div>
                </div>
            )}
        </div>
    );
};

export default WritingGrader; 