<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'priority',
        'status',
        'deadline',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
