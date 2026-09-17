<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add timestamps to the original task-management tables.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->timestamps();
        });

        Schema::table('project_members', function (Blueprint $table): void {
            $table->timestamps();
        });

        Schema::table('tasks', function (Blueprint $table): void {
            $table->timestamps();
        });

    }

    /**
     * Reverse only the fields introduced by this migration.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table): void {
            $table->dropTimestamps();
        });

        Schema::table('project_members', function (Blueprint $table): void {
            $table->dropTimestamps();
        });

        Schema::table('projects', function (Blueprint $table): void {
            $table->dropTimestamps();
        });
    }
};
