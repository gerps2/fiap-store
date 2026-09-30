/** Smoke test do host: garante que o ambiente de testes Karma+Jasmine está saudável. */
describe("host smoke", () => {
  it("ambiente de teste deve estar funcional", () => {
    expect(1 + 1).toBe(2);
  });

  it("typescript strict deve estar ativo", () => {
    const x: number = 42;
    expect(typeof x).toBe("number");
  });
});
