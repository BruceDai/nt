describe('CTS', function() {
  const assert = chai.assert;
  const nn = navigator.ml.getNeuralNetworkContext();

  it('check result for Conv float large weights as inputs example', async function() {
    var model = await nn.createModel();
    var operandIndex = 0;

    let op1_value = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0];
    let op2_value = [1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0];
    let op3_value = [0.0, 0.0, 0.0];
    let op4_expect = [30.0, 36.0, 42.0, 66.0, 81.0, 96.0, 102.0, 126.0, 150.0, 138.0, 171.0, 204.0, 174.0, 216.0, 258.0, 210.0, 261.0, 312.0];

    var type3 = {type: nn.INT32};
    var type0 = {type: nn.TENSOR_FLOAT32, dimensions: [1, 2, 3, 3]};
    var type0_length = product(type0.dimensions);
    var type1 = {type: nn.TENSOR_FLOAT32, dimensions: [3, 1, 1, 3]};
    var type1_length = product(type1.dimensions);
    var type2 = {type: nn.TENSOR_FLOAT32, dimensions: [3]};
    var type2_length = product(type2.dimensions);

    var op1 = operandIndex++;
    model.addOperand(type0);
    var op2 = operandIndex++;
    model.addOperand(type1);
    var op3 = operandIndex++;
    model.addOperand(type2);
    var pad0 = operandIndex++;
    model.addOperand(type3);
    var act = operandIndex++;
    model.addOperand(type3);
    var stride = operandIndex++;
    model.addOperand(type3);
    var op4 = operandIndex++;
    model.addOperand(type0);

    let op2_input = new Float32Array(op2_value);
    model.setOperandValue(op2, op2_input);

    let op3_input = new Float32Array(op3_value);
    model.setOperandValue(op3, op3_input);

    model.setOperandValue(pad0, new Int32Array([0]));
    model.setOperandValue(act, new Int32Array([0]));
    model.setOperandValue(stride, new Int32Array([1]));
    model.addOperation(nn.CONV_2D, [op1, op2, op3, pad0, pad0, pad0, pad0, stride, stride, act], [op4]);

    model.identifyInputsAndOutputs([op1], [op4]);
    await model.finish();

    let compilation = await model.createCompilation();
    compilation.setPreference(nn.PREFER_FAST_SINGLE_ANSWER);
    await compilation.finish();

    let execution = await compilation.createExecution();

    let op1_input = new Float32Array(op1_value);
    execution.setInput(0, op1_input);

    let op4_output = new Float32Array(type0_length);
    execution.setOutput(0, op4_output);

    await execution.startCompute();

    for (let i = 0; i < type0_length; ++i) {
      assert.isTrue(almostEqual(op4_output[i], op4_expect[i]));
    }
  });
});
