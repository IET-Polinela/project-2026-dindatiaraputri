from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Report


class ReportVisibilityTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.admin = User.objects.create_user(
            username='admin',
            password='password',
            is_staff=True,
        )
        self.citizen_a = User.objects.create_user(
            username='citizen_a',
            password='password',
        )
        self.citizen_b = User.objects.create_user(
            username='citizen_b',
            password='password',
        )

        self.a_draft = self.create_report(self.citizen_a, 'Draft A', 'DRAFT')
        self.a_reported = self.create_report(self.citizen_a, 'Reported A', 'REPORTED')
        self.b_draft = self.create_report(self.citizen_b, 'Draft B', 'DRAFT')
        self.b_verified = self.create_report(self.citizen_b, 'Verified B', 'VERIFIED')

    def create_report(self, reporter, title, status):
        return Report.objects.create(
            reporter=reporter,
            title=title,
            category='Infrastruktur',
            description=f'{title} description',
            location='Jakarta',
            status=status,
        )

    def get_reports(self, user, tab=None):
        client = APIClient()
        client.force_authenticate(user=user)
        url = '/api/reports/'
        if tab:
            url = f'{url}?tab={tab}'
        response = client.get(url, HTTP_ACCEPT='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        return data if isinstance(data, list) else data['results']

    def report_ids(self, reports):
        return {report['id'] for report in reports}

    def test_admin_cannot_see_citizen_drafts(self):
        ids = self.report_ids(self.get_reports(self.admin))

        self.assertNotIn(self.a_draft.id, ids)
        self.assertNotIn(self.b_draft.id, ids)
        self.assertIn(self.a_reported.id, ids)
        self.assertIn(self.b_verified.id, ids)

    def test_citizen_main_tab_shows_own_draft_and_all_non_draft_reports(self):
        ids = self.report_ids(self.get_reports(self.citizen_a, tab='my_reports'))

        self.assertIn(self.a_draft.id, ids)
        self.assertIn(self.a_reported.id, ids)
        self.assertNotIn(self.b_draft.id, ids)
        self.assertIn(self.b_verified.id, ids)

    def test_citizen_feed_shows_all_non_draft_reports(self):
        ids = self.report_ids(self.get_reports(self.citizen_a, tab='feed'))

        self.assertNotIn(self.a_draft.id, ids)
        self.assertNotIn(self.b_draft.id, ids)
        self.assertIn(self.a_reported.id, ids)
        self.assertIn(self.b_verified.id, ids)

    def test_citizen_default_view_hides_other_citizen_drafts(self):
        ids = self.report_ids(self.get_reports(self.citizen_a))

        self.assertIn(self.a_draft.id, ids)
        self.assertIn(self.a_reported.id, ids)
        self.assertNotIn(self.b_draft.id, ids)
        self.assertIn(self.b_verified.id, ids)
