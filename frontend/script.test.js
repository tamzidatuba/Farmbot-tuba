function MySpy() {
  this.calls = 0;
}

MySpy.prototype.fn = function () {
  return () => this.calls++;
}

it('Test Button component', () => {
  const mySpy = new MySpy();
  const mockCallBack = mySpy.fn();

  const button = shallow((<seedingJobBtn onClick={mockCallBack}>Ok!</seedingJobBtn>));

  button.find('button').simulate('click');
  expect(mySpy.calls).toEqual(1);
});