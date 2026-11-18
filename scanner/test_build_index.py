import tempfile
import unittest
from pathlib import Path

from scanner.build_index import IndexStore, allowed_commons_license, html_text


class BuildIndexTests(unittest.TestCase):
    def test_allows_only_free_commons_licenses(self):
        for license_name in ("CC0 1.0", "CC BY 4.0", "CC BY-SA 4.0", "Public domain", "PD-old", "PD-US"):
            with self.subTest(license_name=license_name):
                self.assertTrue(allowed_commons_license(license_name))

        for license_name in ("CC BY-NC 4.0", "CC BY-ND 4.0", "CC BY-SA-NC 4.0", "Copyrighted", ""):
            with self.subTest(license_name=license_name):
                self.assertFalse(allowed_commons_license(license_name))

    def test_decodes_and_strips_source_html(self):
        self.assertEqual(html_text("<p>Gold &amp; lapis</p>"), "Gold & lapis")

    def test_source_checkpoint_round_trips(self):
        with tempfile.TemporaryDirectory() as directory:
            store = IndexStore(Path(directory) / "metadata.sqlite")
            try:
                cursor = {"offset": 125, "category": "Category:Ancient Egyptian art"}
                store.checkpoint("commons", cursor)
                self.assertEqual(store.get_checkpoint("commons"), cursor)
            finally:
                store.close()


if __name__ == "__main__":
    unittest.main()
