import { TestBed } from '@angular/core/testing';
import { BILLY_I18N_EN, BILLY_I18N_FR, BillyI18nService, provideBillyI18n } from './billy-i18n';

describe('BillyI18nService', () => {

  it('defaults to English', () => {
    const service = TestBed.inject(BillyI18nService);
    expect(service.locale()).toBe('en');
    expect(service.strings().saveBar.save).toBe('Save');
  });

  it('switches every string when the locale changes', () => {
    const service = TestBed.inject(BillyI18nService);
    service.setLocale('fr');
    expect(service.strings().saveBar.save).toBe('Sauvegarder');
    expect(service.strings().deleteDialog.confirm).toBe('Supprimer');
    expect(service.strings().emptyState.sale.title).toBe('Aucune vente');
  });

  it('applies per-string overrides on top of the locale', () => {
    const service = TestBed.inject(BillyI18nService);
    service.use('fr', { saveBar: { save: 'Enregistrer' } });
    expect(service.strings().saveBar.save).toBe('Enregistrer');
    // Sibling keys of the overridden group keep the locale value.
    expect(service.strings().saveBar.back).toBe('Retour');
  });

  it('keeps overrides when switching locale via setLocale', () => {
    const service = TestBed.inject(BillyI18nService);
    service.use('en', { addButton: { label: 'Create' } });
    service.setLocale('fr');
    expect(service.strings().addButton.label).toBe('Create');
    expect(service.strings().saveBar.save).toBe('Sauvegarder');
  });

  it('is configured at bootstrap by provideBillyI18n', () => {
    TestBed.configureTestingModule({ providers: [provideBillyI18n('fr')] });
    const service = TestBed.inject(BillyI18nService);
    expect(service.locale()).toBe('fr');
    expect(service.strings().toastr.success).toBe('Succès');
  });

  it('exposes complete dictionaries for both locales', () => {
    const flatten = (obj: object): string[] =>
      Object.values(obj).flatMap(v => typeof v === 'string' ? [v] : flatten(v as object));
    // Same shape: every English key has a French counterpart.
    expect(flatten(BILLY_I18N_FR)).toHaveLength(flatten(BILLY_I18N_EN).length);
  });

});
