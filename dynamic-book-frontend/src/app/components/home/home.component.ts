import { Component } from '@angular/core';

interface HomeFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  readonly features: HomeFeature[] = [
    {
      icon: 'cloud_upload',
      title: 'Upload Any Book',
      description: 'Import full-length manuscripts or sample chapters as PDF files with chapter-aware parsing.'
    },
    {
      icon: 'lightbulb',
      title: 'Design What-If Scenarios',
      description: 'Experiment with alternate timelines and character decisions to see how the story evolves.'
    },
    {
      icon: 'compare',
      title: 'Side-by-Side Viewing',
      description: 'Review the original chapter alongside the AI-generated storyline for quick comparison.'
    }
  ];
}
