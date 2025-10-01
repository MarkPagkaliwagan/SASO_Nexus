import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import GuidanceOffice from './GuidanceOffice';
import SFDU from './SFDU';
import SchoolClinic from './SchoolClinic';
import CampusMinistry from './CampusMinistry';
import SportsDevelopmentUnit from './SportsDevelopmentUnit';

/**
 * Map slugs -> components
 * Ensure the slug values match the backend slug generation (Str::slug on department name).
 */
const componentMap = {
  'guidance-office': GuidanceOffice,
  'student-formation-and-development-unit-sfdu': SFDU,
  'school-clinic': SchoolClinic,
  'campus-ministry': CampusMinistry,
  'sports-development-unit': SportsDevelopmentUnit,
};

export default function DepartmentRouter() {
  const { slug } = useParams();

  // Basic auth guard: make sure logged-in staff belongs to this department
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  if (!staff || !localStorage.getItem('staffToken')) {
    // not logged in as staff
    return <Navigate to="/staff/login" replace />;
  }

  const staffSlug = staff?.department?.slug;
  if (!staffSlug) {
    // malformed staff object — send to login
    return <Navigate to="/staff/login" replace />;
  }

  if (staffSlug !== slug) {
    // staff trying to access other department - deny or redirect
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-2">You don't have permission to view this department's page.</p>
      </div>
    );
  }

  const Comp = componentMap[slug];
  if (!Comp) {
    return <div className="p-6">Unknown department</div>;
  }

  return <Comp />;
}
