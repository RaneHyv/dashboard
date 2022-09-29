import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound (props){
  return (
      <>
        <div>
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-8">404 - Not Found!</h1>
                <Link to="/org">Go Home</Link>
              </div>
            </div>
          </main>
        </div>
      </>
  )
}