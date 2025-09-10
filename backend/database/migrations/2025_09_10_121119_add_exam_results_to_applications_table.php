<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            // 🟩 COLLEGE (MAT, APT, GWA)
            $table->string('mat_rs', 20)->nullable();
            $table->string('mat_iq', 20)->nullable();
            $table->string('mat_percentile', 20)->nullable();
            $table->string('mat_classification', 50)->nullable();

            $table->string('apt_verbal_rs', 20)->nullable();
            $table->string('apt_verbal_percentile', 20)->nullable();
            $table->string('apt_verbal_classification', 50)->nullable();

            $table->string('apt_num_rs', 20)->nullable();
            $table->string('apt_num_percentile', 20)->nullable();
            $table->string('apt_num_classification', 50)->nullable();

            $table->string('apt_total_rs', 20)->nullable();
            $table->string('apt_total_percentile', 20)->nullable();
            $table->string('apt_total_classification', 50)->nullable();

            $table->string('gwa_percentile', 20)->nullable();
            $table->string('gwa_classification', 50)->nullable();

            // 🟦 SHS (CFIT & OLSAT)
            $table->string('cfit_rs', 20)->nullable();
            $table->string('cfit_iq', 20)->nullable();
            $table->string('cfit_pc', 20)->nullable();
            $table->string('cfit_classification', 50)->nullable();

            $table->string('olsat_verbal_rs', 20)->nullable();
            $table->string('olsat_verbal_ss', 20)->nullable();
            $table->string('olsat_verbal_percentile', 20)->nullable();
            $table->string('olsat_verbal_stanine', 20)->nullable();
            $table->string('olsat_verbal_classification', 50)->nullable();

            $table->string('olsat_nonverbal_rs', 20)->nullable();
            $table->string('olsat_nonverbal_ss', 20)->nullable();
            $table->string('olsat_nonverbal_pc', 20)->nullable();
            $table->string('olsat_nonverbal_stanine', 20)->nullable();
            $table->string('olsat_nonverbal_classification', 50)->nullable();

            $table->string('olsat_total_rs', 20)->nullable();
            $table->string('olsat_total_ss', 20)->nullable();
            $table->string('olsat_total_pc', 20)->nullable();
            $table->string('olsat_total_stanine', 20)->nullable();
            $table->string('olsat_total_classification', 50)->nullable();

            // 🟨 JHS (VCAT subtests)
            $table->string('vc_rs', 20)->nullable();
            $table->string('vc_pc', 20)->nullable();
            $table->string('vr_rs', 20)->nullable();
            $table->string('vr_pc', 20)->nullable();
            $table->string('fr_rs', 20)->nullable();
            $table->string('fr_pc', 20)->nullable();
            $table->string('qr_rs', 20)->nullable();
            $table->string('qr_pc', 20)->nullable();

            $table->string('verbal_rs', 20)->nullable();
            $table->string('verbal_pc', 20)->nullable();
            $table->string('nonverbal_rs', 20)->nullable();
            $table->string('nonverbal_pc', 20)->nullable();
            $table->string('overall_rs', 20)->nullable();
            $table->string('overall_pc', 20)->nullable();

            // 🔖 Common
            $table->string('remarks', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                // College
                'mat_rs','mat_iq','mat_percentile','mat_classification',
                'apt_verbal_rs','apt_verbal_percentile','apt_verbal_classification',
                'apt_num_rs','apt_num_percentile','apt_num_classification',
                'apt_total_rs','apt_total_percentile','apt_total_classification',
                'gwa_percentile','gwa_classification',

                // SHS
                'cfit_rs','cfit_iq','cfit_pc','cfit_classification',
                'olsat_verbal_rs','olsat_verbal_ss','olsat_verbal_percentile','olsat_verbal_stanine','olsat_verbal_classification',
                'olsat_nonverbal_rs','olsat_nonverbal_ss','olsat_nonverbal_pc','olsat_nonverbal_stanine','olsat_nonverbal_classification',
                'olsat_total_rs','olsat_total_ss','olsat_total_pc','olsat_total_stanine','olsat_total_classification',

                // JHS
                'vc_rs','vc_pc','vr_rs','vr_pc','fr_rs','fr_pc','qr_rs','qr_pc',
                'verbal_rs','verbal_pc','nonverbal_rs','nonverbal_pc','overall_rs','overall_pc',

                // Common
                'remarks'
            ]);
        });
    }
};
