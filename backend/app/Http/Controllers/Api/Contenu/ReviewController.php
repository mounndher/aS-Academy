<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = Review::query()
            ->where('is_approved', true)
            ->latest()
            ->get([
                'id',
                'name',
                'formation',
                'rating',
                'text',
            ])
            ->map(function (Review $review) {
                return [
                    'id' => $review->id,
                    'name' => $review->name,
                    'formation' => $review->formation,
                    'rating' => $review->rating,
                    'text' => $review->text,
                    'initials' => collect(
                        preg_split('/\s+/', trim($review->name))
                    )->filter()
                        ->map(fn ($part) => mb_substr($part, 0, 1))
                        ->take(2)
                        ->implode(''),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }
}
